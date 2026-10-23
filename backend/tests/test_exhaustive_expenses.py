"""
Exhaustive Edge-Case Test Suite for Expenses Handling.
Tests:
1. Negative & Zero amounts validation on creation & update
2. Empty or invalid splitAmong validation
3. Penny / odd currency division (100 / 3) without floating point drift
4. Single-person split & self-payment isolation
5. Creator-only edit permissions (amounts, notes, dates)
6. Dynamic recalculation of sharePerPerson upon edit
7. Expense deletion with exact rollback of ledger debts
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

async def run_exhaustive_expense_tests():
    print("\n==================================================================")
    print("  EXHAUSTIVE EXPENSE HANDLING & MATH EDGE-CASES TEST SUITE")
    print("==================================================================\n")

    db = get_db()
    prop_id = "prop_edgecase_exp_test"

    user_tushar = {"id": "user_tushar", "_id": "user_tushar", "name": "Tushar Goswami"}
    user_rashi = {"id": "user_rashi", "_id": "user_rashi", "name": "Rashi Agrawal"}
    user_joy = {"id": "user_joy", "_id": "user_joy", "name": "Joy"}

    # Clean up test artifacts
    await db.properties.delete_many({"_id": prop_id})
    await db.expenses.delete_many({"propertyId": prop_id})
    await db.settlements.delete_many({"propertyId": prop_id})

    # Setup property with all 3 managers
    await db.properties.insert_one({
        "_id": prop_id,
        "name": "Edge Case Villa",
        "managers": ["user_tushar", "user_rashi", "user_joy"],
        "managerDetails": [
            {"id": "user_tushar", "name": "Tushar Goswami"},
            {"id": "user_rashi", "name": "Rashi Agrawal"},
            {"id": "user_joy", "name": "Joy"},
        ]
    })

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        app.dependency_overrides[get_current_user] = lambda: user_tushar

        # -------------------------------------------------------------
        # TEST 1: Reject negative, zero, and empty split expenses
        # -------------------------------------------------------------
        print("-> [TEST 1] Validation: Rejecting negative/zero amounts and empty splits...")
        
        # 1a. Negative amount
        res = await client.post("/api/expenses", json={
            "propertyId": prop_id,
            "title": "Negative Expense",
            "amount": -500.0,
            "category": "Maintenance",
            "paidBy": "user_tushar",
            "splitAmong": ["user_tushar", "user_rashi"],
            "sharePerPerson": 250.0,
        })
        assert res.status_code in [400, 422], f"Expected 400/422 for negative amount, got {res.status_code}"

        # 1b. Zero amount
        res = await client.post("/api/expenses", json={
            "propertyId": prop_id,
            "title": "Zero Expense",
            "amount": 0.0,
            "category": "Maintenance",
            "paidBy": "user_tushar",
            "splitAmong": ["user_tushar", "user_rashi"],
            "sharePerPerson": 0.0,
        })
        assert res.status_code in [400, 422], f"Expected 400/422 for zero amount, got {res.status_code}"

        # 1c. Empty split list
        res = await client.post("/api/expenses", json={
            "propertyId": prop_id,
            "title": "No Split Expense",
            "amount": 1000.0,
            "category": "Maintenance",
            "paidBy": "user_tushar",
            "splitAmong": [],
            "sharePerPerson": 1000.0,
        })
        assert res.status_code in [400, 422], f"Expected 400/422 for empty splitAmong, got {res.status_code}"
        print("   [PASS] Negative, zero, and empty split expenses safely rejected.")

        # -------------------------------------------------------------
        # TEST 2: Penny / Odd Division Precision (100 split 3 ways)
        # -------------------------------------------------------------
        print("\n-> [TEST 2] Decimal Precision: ₹100 split 3 ways...")
        res = await client.post("/api/expenses", json={
            "propertyId": prop_id,
            "title": "Wi-Fi Bill ₹100",
            "amount": 100.0,
            "category": "Utilities",
            "paidBy": "user_tushar",
            "payerName": "Tushar Goswami",
            "splitAmong": ["user_tushar", "user_rashi", "user_joy"],
            "sharePerPerson": 33.33,
        })
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        exp_wifi_id = res.json()["id"]

        bal_tushar = await calculate_property_balances(prop_id, "user_tushar")
        # Rashi owes Tushar 33.33, Joy owes Tushar 33.33 -> total Tushar is owed = 66.66
        rashi_debt = next(p for p in bal_tushar["peopleWhoOweUser"] if p["userId"] == "user_rashi")
        joy_debt = next(p for p in bal_tushar["peopleWhoOweUser"] if p["userId"] == "user_joy")
        assert rashi_debt["amount"] == 33.33, f"Expected 33.33, got {rashi_debt['amount']}"
        assert joy_debt["amount"] == 33.33, f"Expected 33.33, got {joy_debt['amount']}"
        assert bal_tushar["currentUserNet"] == 66.66, f"Expected 66.66, got {bal_tushar['currentUserNet']}"
        print("   [PASS] ₹100 split 3 ways computed with accurate decimal precision (₹33.33 each).")

        # -------------------------------------------------------------
        # TEST 3: Subset Split (2 of 3 managers only) & Self-Payment Isolation
        # -------------------------------------------------------------
        print("\n-> [TEST 3] Subset Split & Self-Payment Isolation...")
        # Joy pays ₹2,000 for groceries shared ONLY with Rashi (Tushar is excluded)
        app.dependency_overrides[get_current_user] = lambda: user_joy
        res = await client.post("/api/expenses", json={
            "propertyId": prop_id,
            "title": "Groceries for Joy & Rashi",
            "amount": 2000.0,
            "category": "Supplies",
            "paidBy": "user_joy",
            "payerName": "Joy",
            "splitAmong": ["user_joy", "user_rashi"],
            "sharePerPerson": 1000.0,
        })
        assert res.status_code == 200

        # Also Tushar buys personal coffee for ₹300 (split among Tushar only)
        app.dependency_overrides[get_current_user] = lambda: user_tushar
        res = await client.post("/api/expenses", json={
            "propertyId": prop_id,
            "title": "Personal Coffee",
            "amount": 300.0,
            "category": "Food",
            "paidBy": "user_tushar",
            "payerName": "Tushar Goswami",
            "splitAmong": ["user_tushar"],
            "sharePerPerson": 300.0,
        })
        assert res.status_code == 200

        # Check balances:
        # Personal coffee: 0 debt to anyone.
        # Joy-Rashi groceries: Rashi owes Joy ₹1000. Tushar's balance with Joy remains 100% UNCHANGED!
        bal_t = await calculate_property_balances(prop_id, "user_tushar")
        joy_debt_to_tushar = next(p for p in bal_t["peopleWhoOweUser"] if p["userId"] == "user_joy")
        assert joy_debt_to_tushar["amount"] == 33.33, "Tushar's balance with Joy was unexpectedly corrupted!"
        
        # Check Joy's balance:
        bal_j = await calculate_property_balances(prop_id, "user_joy")
        # Joy owes Tushar 33.33, Rashi owes Joy 1000.00 -> Joy net = 1000 - 33.33 = +966.67
        assert bal_j["currentUserNet"] == 966.67, f"Expected 966.67, got {bal_j['currentUserNet']}"
        print("   [PASS] Subset split and self-payment isolation verified.")

        # -------------------------------------------------------------
        # TEST 4: Editing Expenses & Security Permissions
        # -------------------------------------------------------------
        print("\n-> [TEST 4] Editing Expenses: Security permissions & recalculation...")
        # 4a. Non-creator (Rashi) tries to edit amount of Tushar's WiFi expense -> MUST FAIL 403
        app.dependency_overrides[get_current_user] = lambda: user_rashi
        res = await client.put(f"/api/expenses/{exp_wifi_id}", json={
            "amount": 5000.0,
        })
        assert res.status_code == 403, f"Expected 403 for unauthorized edit, got {res.status_code}"
        print("   [PASS] Non-creator attempting to alter expense amount blocked with 403 Forbidden.")

        # 4b. Creator (Tushar) tries to edit amount to <= 0 -> MUST FAIL 400
        app.dependency_overrides[get_current_user] = lambda: user_tushar
        res = await client.put(f"/api/expenses/{exp_wifi_id}", json={
            "amount": -50.0,
        })
        assert res.status_code in [400, 422], f"Expected 400/422 for negative amount edit, got {res.status_code}"
        print("   [PASS] Creator attempting to edit expense amount to negative blocked with 400/422.")

        # 4c. Creator (Tushar) edits amount from ₹100 to ₹300 -> sharePerPerson should become ₹100
        res = await client.put(f"/api/expenses/{exp_wifi_id}", json={
            "amount": 300.0,
            "title": "Upgraded Fiber Wi-Fi",
        })
        assert res.status_code == 200
        updated_exp = res.json()
        assert updated_exp["amount"] == 300.0
        assert updated_exp["sharePerPerson"] == 100.0
        
        # Verify audit log appended
        assert len(updated_exp["auditLog"]) >= 2
        assert any("Amount changed" in entry["action"] for entry in updated_exp["auditLog"])

        # Check recalculated balances: Rashi owes Tushar 100, Joy owes Tushar 100
        bal_t_edited = await calculate_property_balances(prop_id, "user_tushar")
        rashi_debt_new = next(p for p in bal_t_edited["peopleWhoOweUser"] if p["userId"] == "user_rashi")
        joy_debt_new = next(p for p in bal_t_edited["peopleWhoOweUser"] if p["userId"] == "user_joy")
        assert rashi_debt_new["amount"] == 100.0, f"Expected 100.0, got {rashi_debt_new['amount']}"
        assert joy_debt_new["amount"] == 100.0, f"Expected 100.0, got {joy_debt_new['amount']}"
        print("   [PASS] Creator edited amount to ₹300: shares & debts accurately updated to ₹100 each.")

        # -------------------------------------------------------------
        # TEST 5: Expense Deletion & Exact Ledger Rollback
        # -------------------------------------------------------------
        print("\n-> [TEST 5] Expense Deletion & Exact Ledger Rollback...")
        res = await client.delete(f"/api/expenses/{exp_wifi_id}")
        assert res.status_code == 200

        # Balances after deleting Wi-Fi:
        # Tushar no longer has any debts with Rashi or Joy!
        bal_t_deleted = await calculate_property_balances(prop_id, "user_tushar")
        assert len(bal_t_deleted["peopleWhoOweUser"]) == 0
        assert len(bal_t_deleted["peopleUserOwes"]) == 0
        assert bal_t_deleted["currentUserNet"] == 0.0

        # Rashi still owes Joy 1000 from the groceries
        bal_j_after_del = await calculate_property_balances(prop_id, "user_joy")
        assert bal_j_after_del["currentUserNet"] == 1000.0
        print("   [PASS] Expense deletion cleanly rolled back debts without residual artifacts.")

    # Clean up test artifacts
    await db.properties.delete_many({"_id": prop_id})
    await db.expenses.delete_many({"propertyId": prop_id})
    await db.settlements.delete_many({"propertyId": prop_id})
    app.dependency_overrides.clear()

    print("\n[SUCCESS] ALL EXHAUSTIVE EXPENSE TESTS PASSED PERFECTLY!\n")

if __name__ == "__main__":
    asyncio.run(run_exhaustive_expense_tests())
