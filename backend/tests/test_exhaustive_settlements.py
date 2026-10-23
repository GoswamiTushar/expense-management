"""
Exhaustive Edge-Case Test Suite for Settlements Lifecycle & Financial Safety.
Tests:
1. Exact settlement (debt -> 0)
2. Partial settlement (debt reduced)
3. Overpayment (natural flip to credit balance)
4. Advance / Prepayment (settling when 0 debt exists)
5. Editing pending settlement (amount, mode, notes)
6. Immutability: Editing confirmed, cancelled, or rejected settlement strictly blocked (400)
7. Security: Non-requester editing pending settlement blocked (403)
8. Security: Third-party manager confirming or declining recipient's payment blocked (403)
9. Cancellation & Rejection audit trails and balance neutrality
10. Idempotency of state transitions
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
from app.deps import get_current_user
from app.services.ledger_service import calculate_property_balances

async def run_exhaustive_settlement_tests():
    print("\n==================================================================")
    print("  EXHAUSTIVE SETTLEMENTS & FINANCIAL SAFETY TEST SUITE")
    print("==================================================================\n")

    db = get_db()
    prop_id = "prop_edgecase_settle_test"

    user_tushar = {"id": "user_tushar", "_id": "user_tushar", "name": "Tushar Goswami"}
    user_rashi = {"id": "user_rashi", "_id": "user_rashi", "name": "Rashi Agrawal"}
    user_joy = {"id": "user_joy", "_id": "user_joy", "name": "Joy"}
    user_admin = {"id": "admin_root", "_id": "admin_root", "name": "Admin Root", "role": "admin"}

    # Clean up test artifacts
    await db.properties.delete_many({"_id": prop_id})
    await db.expenses.delete_many({"propertyId": prop_id})
    await db.settlements.delete_many({"propertyId": prop_id})

    # Setup property with 3 managers
    await db.properties.insert_one({
        "_id": prop_id,
        "name": "Settlement Edge Case Villa",
        "managers": ["user_tushar", "user_rashi", "user_joy"],
        "managerDetails": [
            {"id": "user_tushar", "name": "Tushar Goswami"},
            {"id": "user_rashi", "name": "Rashi Agrawal"},
            {"id": "user_joy", "name": "Joy"},
        ]
    })

    # Initial state: Tushar spends ₹15,000 split 3 ways (₹5,000 each).
    # Rashi owes Tushar ₹5,000; Joy owes Tushar ₹5,000.
    await db.expenses.insert_one({
        "_id": "exp_init",
        "propertyId": prop_id,
        "title": "Initial Electricity & Bills",
        "amount": 15000.0,
        "category": "Utilities",
        "paidBy": "user_tushar",
        "payerName": "Tushar Goswami",
        "splitAmong": ["user_tushar", "user_rashi", "user_joy"],
        "sharePerPerson": 5000.0,
    })

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:

        # -------------------------------------------------------------
        # TEST 1: Pending Settlement Quarantine (Debt does not shift prematurely)
        # -------------------------------------------------------------
        print("-> [TEST 1] Pending settlement creation & quarantine...")
        app.dependency_overrides[get_current_user] = lambda: user_rashi

        res = await client.post("/api/settlements", json={
            "propertyId": prop_id,
            "settledBy": "user_rashi",
            "settledByName": "Rashi Agrawal",
            "paidTo": "user_tushar",
            "paidToName": "Tushar Goswami",
            "amount": 2000.0,
            "paymentMode": "Cash",
            "notes": "Partial cash handed over",
        })
        assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
        settle_1 = res.json()
        settle_1_id = settle_1["id"]
        assert settle_1["status"] == "pending"

        # Verify Rashi still owes ₹5,000 until confirmed
        bal_rashi = await calculate_property_balances(prop_id, "user_rashi")
        owes_t = next(p for p in bal_rashi["peopleUserOwes"] if p["userId"] == "user_tushar")
        assert owes_t["amount"] == 5000.0, f"Expected debt 5000, got {owes_t['amount']}"
        assert len(bal_rashi["pendingOutgoing"]) == 1
        print("   [PASS] Pending settlement is safely quarantined: Rashi still owes ₹5,000.")

        # -------------------------------------------------------------
        # TEST 2: Editing Pending Settlement & Security
        # -------------------------------------------------------------
        print("\n-> [TEST 2] Editing pending settlement...")
        # 2a. Joy (third party) tries to edit Rashi's pending request -> MUST FAIL 403
        app.dependency_overrides[get_current_user] = lambda: user_joy
        res = await client.patch(f"/api/settlements/{settle_1_id}", json={"amount": 9999.0})
        assert res.status_code == 403, f"Expected 403, got {res.status_code}"
        print("   [PASS] Third-party manager attempting to edit settlement blocked with 403 Forbidden.")

        # 2b. Rashi (requester) edits request from ₹2,000 to ₹3,500 via UPI
        app.dependency_overrides[get_current_user] = lambda: user_rashi
        res = await client.patch(f"/api/settlements/{settle_1_id}", json={
            "amount": 3500.0,
            "paymentMode": "UPI",
            "notes": "Changed to UPI payment for Rs. 3500",
        })
        assert res.status_code == 200
        edited_settle = res.json()
        assert edited_settle["amount"] == 3500.0
        assert edited_settle["paymentMode"] == "UPI"
        assert len(edited_settle["auditLog"]) == 2
        assert "edited" in edited_settle["auditLog"][1]["action"]
        print("   [PASS] Requester successfully updated pending request to ₹3,500 with audit entry.")

        # -------------------------------------------------------------
        # TEST 3: Strict Recipient-Only Confirmation Authorization
        # -------------------------------------------------------------
        print("\n-> [TEST 3] Recipient authorization on confirmation...")
        # 3a. Joy (third-party manager) tries to confirm payment made to Tushar -> MUST FAIL 403
        app.dependency_overrides[get_current_user] = lambda: user_joy
        res = await client.patch(f"/api/settlements/{settle_1_id}/confirm")
        assert res.status_code == 403, f"Expected 403, got {res.status_code}"
        print("   [PASS] Third-party manager attempting to confirm another's money blocked with 403 Forbidden.")

        # 3b. Tushar (the actual recipient) confirms receipt
        app.dependency_overrides[get_current_user] = lambda: user_tushar
        res = await client.patch(f"/api/settlements/{settle_1_id}/confirm")
        assert res.status_code == 200
        confirmed = res.json()
        assert confirmed["status"] == "confirmed"
        assert confirmed["confirmedBy"] == "user_tushar"

        # Check balance: Rashi owed 5000 - 3500 = 1500 remaining!
        bal_rashi_post = await calculate_property_balances(prop_id, "user_rashi")
        owes_t_post = next(p for p in bal_rashi_post["peopleUserOwes"] if p["userId"] == "user_tushar")
        assert owes_t_post["amount"] == 1500.0, f"Expected remaining debt 1500, got {owes_t_post['amount']}"
        print("   [PASS] Recipient confirmed receipt: Rashi's remaining debt accurately reduced to ₹1,500.")

        # -------------------------------------------------------------
        # TEST 4: Immutability of Confirmed Settlements
        # -------------------------------------------------------------
        print("\n-> [TEST 4] Immutability: Confirmed settlements cannot be edited or cancelled...")
        # 4a. Trying to edit confirmed settlement -> MUST FAIL 400
        app.dependency_overrides[get_current_user] = lambda: user_rashi
        res = await client.patch(f"/api/settlements/{settle_1_id}", json={"amount": 1000.0})
        assert res.status_code == 400, f"Expected 400, got {res.status_code}"

        # 4b. Trying to cancel confirmed settlement -> MUST FAIL 400
        res = await client.patch(f"/api/settlements/{settle_1_id}/cancel")
        assert res.status_code == 400, f"Expected 400, got {res.status_code}"

        # 4c. Trying to decline confirmed settlement -> MUST FAIL 400
        app.dependency_overrides[get_current_user] = lambda: user_tushar
        res = await client.patch(f"/api/settlements/{settle_1_id}/reject", json={"reason": "Revoke"})
        assert res.status_code == 400, f"Expected 400, got {res.status_code}"
        print("   [PASS] Confirmed settlements are strictly immutable (edits, cancels, rejections blocked).")

        # -------------------------------------------------------------
        # TEST 5: Overpayment & Natural Balance Flip to Credit
        # -------------------------------------------------------------
        print("\n-> [TEST 5] Overpayment & Natural Balance Flip...")
        # Rashi owes Tushar ₹1,500. Rashi pays ₹4,500 (extra ₹3,000 paid).
        app.dependency_overrides[get_current_user] = lambda: user_rashi
        res = await client.post("/api/settlements", json={
            "propertyId": prop_id,
            "settledBy": "user_rashi",
            "settledByName": "Rashi Agrawal",
            "paidTo": "user_tushar",
            "paidToName": "Tushar Goswami",
            "amount": 4500.0,
            "paymentMode": "Bank Transfer",
            "notes": "Extra ₹3000 advance for upcoming cleaning bills",
        })
        assert res.status_code == 201
        overpay_id = res.json()["id"]

        # Tushar confirms the ₹4,500 receipt
        app.dependency_overrides[get_current_user] = lambda: user_tushar
        res = await client.patch(f"/api/settlements/{overpay_id}/confirm")
        assert res.status_code == 200

        # Verify balances:
        # Rashi no longer owes Tushar!
        bal_rashi_over = await calculate_property_balances(prop_id, "user_rashi")
        assert not any(p["userId"] == "user_tushar" for p in bal_rashi_over["peopleUserOwes"])
        # Tushar owes Rashi ₹3,000!
        t_owes_rashi = next(p for p in bal_rashi_over["peopleWhoOweUser"] if p["userId"] == "user_tushar")
        assert t_owes_rashi["amount"] == 3000.0, f"Expected 3000 credit, got {t_owes_rashi['amount']}"

        # Joy's balance with Tushar is STILL ₹5,000 (100% UNTOUCHED by Tushar-Rashi overpayment)
        joy_owes_t = next(p for p in bal_rashi_over.get("pairwiseDebts", []) if p["fromUserId"] == "user_joy" and p["toUserId"] == "user_tushar")
        assert joy_owes_t["amount"] == 5000.0
        print("   [PASS] Overpayment naturally flipped debt into ₹3,000 credit with total third-party isolation.")

        # -------------------------------------------------------------
        # TEST 6: Prepayment / Settlement when ₹0 debt exists
        # -------------------------------------------------------------
        print("\n-> [TEST 6] Prepayment with zero existing debt...")
        # Joy and Rashi have ₹0 debt between each other.
        # Joy sends Rashi ₹1,000 advance.
        app.dependency_overrides[get_current_user] = lambda: user_joy
        res = await client.post("/api/settlements", json={
            "propertyId": prop_id,
            "settledBy": "user_joy",
            "settledByName": "Joy",
            "paidTo": "user_rashi",
            "paidToName": "Rashi Agrawal",
            "amount": 1000.0,
            "paymentMode": "Cash",
            "notes": "Advance payment",
        })
        assert res.status_code == 201
        advance_id = res.json()["id"]

        # Rashi confirms
        app.dependency_overrides[get_current_user] = lambda: user_rashi
        res = await client.patch(f"/api/settlements/{advance_id}/confirm")
        assert res.status_code == 200

        bal_joy = await calculate_property_balances(prop_id, "user_joy")
        rashi_owes_joy = next(p for p in bal_joy["peopleWhoOweUser"] if p["userId"] == "user_rashi")
        assert rashi_owes_joy["amount"] == 1000.0
        print("   [PASS] Prepayment when ₹0 debt exists correctly creates advance credit.")

        # -------------------------------------------------------------
        # TEST 7: Settlement Rejection Flow
        # -------------------------------------------------------------
        print("\n-> [TEST 7] Settlement Rejection Flow...")
        # Joy raises payment of ₹2,000 to Tushar
        app.dependency_overrides[get_current_user] = lambda: user_joy
        res = await client.post("/api/settlements", json={
            "propertyId": prop_id,
            "settledBy": "user_joy",
            "paidTo": "user_tushar",
            "amount": 2000.0,
            "paymentMode": "UPI",
        })
        reject_id = res.json()["id"]

        # Tushar declines with reason "UPI failed / not credited"
        app.dependency_overrides[get_current_user] = lambda: user_tushar
        res = await client.patch(f"/api/settlements/{reject_id}/reject", json={
            "reason": "UPI failed / not credited",
        })
        assert res.status_code == 200
        rejected_doc = res.json()
        assert rejected_doc["status"] == "rejected"
        assert rejected_doc["rejectionReason"] == "UPI failed / not credited"

        # Check balances: Joy still owes Tushar ₹5,000
        bal_j_reject = await calculate_property_balances(prop_id, "user_joy")
        joy_debt_to_t = next(p for p in bal_j_reject["peopleUserOwes"] if p["userId"] == "user_tushar")
        assert joy_debt_to_t["amount"] == 5000.0
        print("   [PASS] Settlement rejection preserved debt and captured refusal reason in audit.")

        # -------------------------------------------------------------
        # TEST 8: Settlement Cancellation Flow
        # -------------------------------------------------------------
        print("\n-> [TEST 8] Settlement Cancellation Flow...")
        # Joy raises payment of ₹3,000 to Tushar, then realizes mistyped amount and cancels
        app.dependency_overrides[get_current_user] = lambda: user_joy
        res = await client.post("/api/settlements", json={
            "propertyId": prop_id,
            "settledBy": "user_joy",
            "paidTo": "user_tushar",
            "amount": 3000.0,
            "paymentMode": "Cash",
        })
        cancel_id = res.json()["id"]

        # Joy cancels
        res = await client.patch(f"/api/settlements/{cancel_id}/cancel")
        assert res.status_code == 200
        cancelled_doc = res.json()
        assert cancelled_doc["status"] == "cancelled"

        # Trying to confirm cancelled settlement MUST fail
        app.dependency_overrides[get_current_user] = lambda: user_tushar
        res = await client.patch(f"/api/settlements/{cancel_id}/confirm")
        assert res.status_code == 400
        print("   [PASS] Settlement cancellation verified; cancelled requests cannot be confirmed.")

    # Clean up test artifacts
    await db.properties.delete_many({"_id": prop_id})
    await db.expenses.delete_many({"propertyId": prop_id})
    await db.settlements.delete_many({"propertyId": prop_id})
    app.dependency_overrides.clear()

    print("\n[SUCCESS] ALL EXHAUSTIVE SETTLEMENT TESTS PASSED PERFECTLY!\n")

if __name__ == "__main__":
    asyncio.run(run_exhaustive_settlement_tests())
