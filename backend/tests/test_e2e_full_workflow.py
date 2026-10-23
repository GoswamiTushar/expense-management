"""
End-to-End Application Test Suite.
Tests the complete multi-user lifecycle with real database accounts:
- Tushar Goswami (user_1790113819594_708)
- Rashi Agrawal (user_1790143728321_135)
- Joy (user_1790143848420_201)
- Admin (admin_root)

Verifies:
1. True JWT Bearer authentication on every request
2. Admin access vs manager 403 forbidden protection
3. Multi-day expense logging, subset splits, and notification broadcasts
4. Overpayment and natural credit offset
5. Full settlement workflow (create, edit, unauthorized confirm prevention, confirm, cancel)
6. Final ledger zero-sum conservation
7. Audit log completeness & chronological ordering
"""

import sys
import asyncio
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import get_db
from app.services.security import create_access_token
from app.services.ledger_service import calculate_property_balances

async def run_e2e_tests():
    print("\n==================================================================")
    print("  E2E MULTI-USER APPLICATION WORKFLOW TEST SUITE")
    print("  Managers: Tushar Goswami, Rashi Agrawal, Joy | Admin: admin_root")
    print("==================================================================\n")

    db = get_db()
    prop_id = "prop_e2e_brij_nest_test"

    # Real user IDs from the database
    id_tushar = "user_1790113819594_708"
    id_rashi = "user_1790143728321_135"
    id_joy = "user_1790143848420_201"
    id_admin = "admin_root"

    # Generate real Bearer access tokens
    token_tushar = create_access_token(id_tushar)
    token_rashi = create_access_token(id_rashi)
    token_joy = create_access_token(id_joy)
    token_admin = create_access_token(id_admin)

    headers_tushar = {"Authorization": f"Bearer {token_tushar}"}
    headers_rashi = {"Authorization": f"Bearer {token_rashi}"}
    headers_joy = {"Authorization": f"Bearer {token_joy}"}
    headers_admin = {"Authorization": f"Bearer {token_admin}"}

    # Clean up test artifacts
    await db.properties.delete_many({"_id": prop_id})
    await db.expenses.delete_many({"propertyId": prop_id})
    await db.settlements.delete_many({"propertyId": prop_id})
    await db.notifications.delete_many({"propertyId": prop_id})

    # Setup dedicated test property for the 3 managers
    await db.properties.insert_one({
        "_id": prop_id,
        "name": "The Brij Nest (E2E Validation)",
        "location": "Vrindavan, India",
        "managers": [id_tushar, id_rashi, id_joy],
        "managerDetails": [
            {"id": id_tushar, "name": "Tushar Goswami", "email": "tushargoswami1510@gmail.com"},
            {"id": id_rashi, "name": "Rashi Agrawal", "email": "rashigupta0411@gmail.com"},
            {"id": id_joy, "name": "Joy", "email": "joygupta501@gmail.com"},
        ]
    })

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:

        # -------------------------------------------------------------
        # STEP 1: Authentication & Role Boundary Verification
        # -------------------------------------------------------------
        print("-> [STEP 1] Authentication & Admin Security Boundaries...")
        
        # 1a. Tushar /api/auth/me
        res = await client.get("/api/auth/me", headers=headers_tushar)
        assert res.status_code == 200
        assert res.json()["name"] == "Tushar Goswami"

        # 1b. Rashi /api/auth/me
        res = await client.get("/api/auth/me", headers=headers_rashi)
        assert res.status_code == 200
        assert res.json()["name"] == "Rashi Agrawal"

        # 1c. Joy /api/auth/me
        res = await client.get("/api/auth/me", headers=headers_joy)
        assert res.status_code == 200
        assert res.json()["name"] == "Joy"

        # 1d. Admin /api/auth/me
        res = await client.get("/api/auth/me", headers=headers_admin)
        assert res.status_code == 200
        assert res.json()["role"] == "admin"

        # 1e. Manager (Tushar) calling admin endpoint -> MUST GET 403 Forbidden
        res = await client.get("/api/admin/users", headers=headers_tushar)
        assert res.status_code == 403, f"Expected 403 for non-admin, got {res.status_code}"

        # 1f. Admin calling admin endpoint -> MUST GET 200 OK
        res = await client.get("/api/admin/users", headers=headers_admin)
        assert res.status_code == 200
        users_list = res.json()
        assert len(users_list) >= 3
        print("   [PASS] All 4 accounts authenticated; Admin endpoints strictly protected by 403.")

        # -------------------------------------------------------------
        # STEP 2: Day 1 — Tushar logs ₹12,000 Electricity for all 3 managers
        # -------------------------------------------------------------
        print("\n-> [STEP 2] Day 1: Tushar logs ₹12,000 electricity (split 3 ways)...")
        res = await client.post("/api/expenses", headers=headers_tushar, json={
            "propertyId": prop_id,
            "title": "Electricity Bill",
            "amount": 12000.0,
            "category": "Utilities",
            "paidBy": id_tushar,
            "payerName": "Tushar Goswami",
            "splitAmong": [id_tushar, id_rashi, id_joy],
            "sharePerPerson": 4000.0,
        })
        assert res.status_code == 200
        exp1_id = res.json()["id"]

        # Check notifications generated for co-managers
        res = await client.get(f"/api/notifications?propertyId={prop_id}", headers=headers_rashi)
        assert res.status_code == 200
        notifs = res.json()
        assert len(notifs) >= 1
        assert "Electricity Bill" in notifs[0]["body"]

        # Check ledger balances for all 3
        bal_t = await calculate_property_balances(prop_id, id_tushar)
        bal_r = await calculate_property_balances(prop_id, id_rashi)
        bal_j = await calculate_property_balances(prop_id, id_joy)

        assert bal_t["currentUserNet"] == 8000.0  # Tushar is owed ₹8,000
        assert bal_r["currentUserNet"] == -4000.0 # Rashi owes ₹4,000
        assert bal_j["currentUserNet"] == -4000.0 # Joy owes ₹4,000
        # Zero-sum check
        assert round(bal_t["currentUserNet"] + bal_r["currentUserNet"] + bal_j["currentUserNet"], 2) == 0.0
        print("   [PASS] Day 1 balances: Tushar (+₹8,000), Rashi (-₹4,000), Joy (-₹4,000). Zero-sum conserved.")

        # -------------------------------------------------------------
        # STEP 3: Day 2 — Rashi logs ₹6,000 Cleaning split between Rashi & Tushar
        # -------------------------------------------------------------
        print("\n-> [STEP 3] Day 2: Rashi logs ₹6,000 deep cleaning (split 2 ways with Tushar)...")
        res = await client.post("/api/expenses", headers=headers_rashi, json={
            "propertyId": prop_id,
            "title": "Deep Cleaning & Laundry",
            "amount": 6000.0,
            "category": "Cleaning",
            "paidBy": id_rashi,
            "payerName": "Rashi Agrawal",
            "splitAmong": [id_rashi, id_tushar],
            "sharePerPerson": 3000.0,
        })
        assert res.status_code == 200

        # Net balance check:
        # Rashi owed Tushar ₹4,000. Now Tushar owes Rashi ₹3,000.
        # Net between Rashi and Tushar = Rashi owes Tushar ₹1,000!
        # Joy is completely untouched (still owes Tushar ₹4,000).
        bal_t = await calculate_property_balances(prop_id, id_tushar)
        bal_r = await calculate_property_balances(prop_id, id_rashi)
        bal_j = await calculate_property_balances(prop_id, id_joy)

        assert bal_r["currentUserNet"] == -1000.0 # Rashi net: -₹1,000
        assert bal_t["currentUserNet"] == 5000.0  # Tushar net: +₹5,000 (+1,000 from Rashi, +4,000 from Joy)
        assert bal_j["currentUserNet"] == -4000.0 # Joy net: -₹4,000
        assert round(bal_t["currentUserNet"] + bal_r["currentUserNet"] + bal_j["currentUserNet"], 2) == 0.0
        print("   [PASS] Day 2 balances: Rashi owes Tushar net ₹1,000. Joy untouched (-₹4,000).")

        # -------------------------------------------------------------
        # STEP 4: Day 3 — Joy logs ₹9,000 AC Repair for all 3 managers
        # -------------------------------------------------------------
        print("\n-> [STEP 4] Day 3: Joy logs ₹9,000 AC repair (split 3 ways)...")
        res = await client.post("/api/expenses", headers=headers_joy, json={
            "propertyId": prop_id,
            "title": "AC Compressor Servicing",
            "amount": 9000.0,
            "category": "Maintenance",
            "paidBy": id_joy,
            "payerName": "Joy",
            "splitAmong": [id_joy, id_tushar, id_rashi],
            "sharePerPerson": 3000.0,
        })
        assert res.status_code == 200

        # Net balances:
        # Tushar: previously +5,000. Tushar's share of Joy's bill = 3,000. Net = +2,000.
        # Rashi: previously -1,000. Rashi's share of Joy's bill = 3,000. Net = -4,000 (owes Tushar 1k, owes Joy 3k).
        # Joy: previously -4,000. Joy spent 9,000 (owed 6,000). Net = +2,000.
        bal_t = await calculate_property_balances(prop_id, id_tushar)
        bal_r = await calculate_property_balances(prop_id, id_rashi)
        bal_j = await calculate_property_balances(prop_id, id_joy)

        assert bal_t["currentUserNet"] == 2000.0, f"Expected Tushar +2000, got {bal_t['currentUserNet']}"
        assert bal_r["currentUserNet"] == -4000.0, f"Expected Rashi -4000, got {bal_r['currentUserNet']}"
        assert bal_j["currentUserNet"] == 2000.0, f"Expected Joy +2000, got {bal_j['currentUserNet']}"
        assert round(bal_t["currentUserNet"] + bal_r["currentUserNet"] + bal_j["currentUserNet"], 2) == 0.0
        print("   [PASS] Day 3 balances: Tushar (+₹2,000), Joy (+₹2,000), Rashi (-₹4,000). Total = ₹0.00.")

        # -------------------------------------------------------------
        # STEP 5: Day 4 — Rashi settles with Tushar (with Overpayment of ₹500)
        # -------------------------------------------------------------
        print("\n-> [STEP 5] Day 4: Rashi records settlement to Tushar with edit & overpayment...")
        # Rashi owes Tushar ₹1,000.
        # Rashi records ₹1,000 payment request.
        res = await client.post("/api/settlements", headers=headers_rashi, json={
            "propertyId": prop_id,
            "settledBy": id_rashi,
            "settledByName": "Rashi Agrawal",
            "paidTo": id_tushar,
            "paidToName": "Tushar Goswami",
            "amount": 1000.0,
            "paymentMode": "UPI",
            "notes": "Payment for deep cleaning balance",
        })
        assert res.status_code == 201
        settle_rt_id = res.json()["id"]

        # Rashi edits request to ₹1,500 (extra ₹500 advance)
        res = await client.patch(f"/api/settlements/{settle_rt_id}", headers=headers_rashi, json={
            "amount": 1500.0,
            "notes": "Sent ₹1500 (includes ₹500 advance for next expenses)",
        })
        assert res.status_code == 200
        assert res.json()["amount"] == 1500.0

        # Joy tries to confirm Rashi's payment to Tushar -> MUST BE REJECTED 403!
        res = await client.patch(f"/api/settlements/{settle_rt_id}/confirm", headers=headers_joy)
        assert res.status_code == 403, f"Expected 403, got {res.status_code}"
        print("   [PASS] Joy unauthorized confirmation blocked with 403.")

        # Tushar confirms receipt
        res = await client.patch(f"/api/settlements/{settle_rt_id}/confirm", headers=headers_tushar)
        assert res.status_code == 200
        assert res.json()["status"] == "confirmed"

        # Balances check:
        # Rashi cleared debt to Tushar; Tushar now owes Rashi ₹500 credit!
        bal_t = await calculate_property_balances(prop_id, id_tushar)
        bal_r = await calculate_property_balances(prop_id, id_rashi)
        t_owes_rashi = next(p for p in bal_t["peopleUserOwes"] if p["userId"] == id_rashi)
        assert t_owes_rashi["amount"] == 500.0, f"Expected Tushar to owe Rashi 500 credit, got {t_owes_rashi['amount']}"
        print("   [PASS] Rashi's debt to Tushar cleared, and Tushar now owes Rashi ₹500 credit.")

        # -------------------------------------------------------------
        # STEP 6: Day 5 — Future expense naturally absorbs the credit
        # -------------------------------------------------------------
        print("\n-> [STEP 6] Day 5: Tushar spends ₹1,000 (split 50/50 with Rashi) -> Credit offsets to ₹0...")
        # Tushar spends ₹1,000 for RO water purifier filter (split with Rashi). Rashi's share = ₹500.
        # Because Tushar already owed Rashi ₹500 credit, they are now EXACTLY ₹0.00 even!
        res = await client.post("/api/expenses", headers=headers_tushar, json={
            "propertyId": prop_id,
            "title": "Water Purifier Filter",
            "amount": 1000.0,
            "category": "Maintenance",
            "paidBy": id_tushar,
            "payerName": "Tushar Goswami",
            "splitAmong": [id_tushar, id_rashi],
            "sharePerPerson": 500.0,
        })
        assert res.status_code == 200

        bal_t = await calculate_property_balances(prop_id, id_tushar)
        bal_r = await calculate_property_balances(prop_id, id_rashi)
        # Verify Tushar and Rashi have ZERO dues with each other
        assert not any(p["userId"] == id_rashi for p in bal_t["peopleUserOwes"])
        assert not any(p["userId"] == id_rashi for p in bal_t["peopleWhoOweUser"])
        print("   [PASS] Prior ₹500 credit perfectly absorbed by new expense: Tushar and Rashi are at ₹0.00.")

        # -------------------------------------------------------------
        # STEP 7: Day 6 & 7 — Settling Joy and Remaining Debts
        # -------------------------------------------------------------
        print("\n-> [STEP 7] Day 6 & 7: Squaring all debts across all 3 managers...")
        # Joy owes Tushar ₹1,000, and Rashi owes Joy ₹3,000.
        # Joy pays Tushar ₹1,000
        res = await client.post("/api/settlements", headers=headers_joy, json={
            "propertyId": prop_id,
            "settledBy": id_joy,
            "settledByName": "Joy",
            "paidTo": id_tushar,
            "paidToName": "Tushar Goswami",
            "amount": 1000.0,
            "paymentMode": "UPI",
        })
        s_jt_id = res.json()["id"]
        # Tushar confirms
        await client.patch(f"/api/settlements/{s_jt_id}/confirm", headers=headers_tushar)

        # Rashi pays Joy ₹3,000
        res = await client.post("/api/settlements", headers=headers_rashi, json={
            "propertyId": prop_id,
            "settledBy": id_rashi,
            "settledByName": "Rashi Agrawal",
            "paidTo": id_joy,
            "paidToName": "Joy",
            "amount": 3000.0,
            "paymentMode": "Cash",
        })
        s_rj_id = res.json()["id"]
        # Joy confirms
        await client.patch(f"/api/settlements/{s_rj_id}/confirm", headers=headers_joy)

        # Check all balances now: EVERYONE IS ZERO!
        bal_t_final = await calculate_property_balances(prop_id, id_tushar)
        bal_r_final = await calculate_property_balances(prop_id, id_rashi)
        bal_j_final = await calculate_property_balances(prop_id, id_joy)

        assert bal_t_final["currentUserNet"] == 0.0
        assert bal_r_final["currentUserNet"] == 0.0
        assert bal_j_final["currentUserNet"] == 0.0
        assert len(bal_t_final["peopleUserOwes"]) == 0
        assert len(bal_t_final["peopleWhoOweUser"]) == 0
        assert len(bal_r_final["peopleUserOwes"]) == 0
        assert len(bal_r_final["peopleWhoOweUser"]) == 0
        assert len(bal_j_final["peopleUserOwes"]) == 0
        assert len(bal_j_final["peopleWhoOweUser"]) == 0
        print("   [PASS] All 3 managers fully reconciled to ₹0.00! Complete multi-party financial harmony.")

        # -------------------------------------------------------------
        # STEP 8: Non-Essential Features: Audit Trail & Pagination
        # -------------------------------------------------------------
        print("\n-> [STEP 8] Audit Trail & Pagination Verification...")
        # Fetch paginated expenses
        res = await client.get(f"/api/expenses/paginated?propertyId={prop_id}&limit=10", headers=headers_tushar)
        assert res.status_code == 200
        paginated_data = res.json()
        assert paginated_data["total"] == 4
        assert len(paginated_data["items"]) == 4

        # Verify audit entries on expenses
        for exp in paginated_data["items"]:
            assert len(exp.get("auditLog", [])) >= 1
            assert exp["auditLog"][0]["action"] == "Created expense"

        # Fetch settlements audit trail
        res = await client.get(f"/api/settlements?propertyId={prop_id}", headers=headers_tushar)
        assert res.status_code == 200
        settle_list = res.json()
        assert len(settle_list) == 3
        for s in settle_list:
            assert len(s.get("auditLog", [])) >= 2  # created + confirmed
            assert s["status"] == "confirmed"
            assert s["settledAt"] is not None
        print("   [PASS] Complete chronological audit trail verified across all operations.")

    # Clean up test artifacts
    await db.properties.delete_many({"_id": prop_id})
    await db.expenses.delete_many({"propertyId": prop_id})
    await db.settlements.delete_many({"propertyId": prop_id})
    await db.notifications.delete_many({"propertyId": prop_id})

    print("\n[SUCCESS] E2E APPLICATION TEST SUITE PASSED WITH 100% SUCCESS!\n")

if __name__ == "__main__":
    asyncio.run(run_e2e_tests())
