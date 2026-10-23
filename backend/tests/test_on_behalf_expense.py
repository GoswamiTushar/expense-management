import sys
import asyncio
from pathlib import Path
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import get_db
from app.deps import get_current_user

async def run_on_behalf_tests():
    print("\n--- Running On-Behalf Expense Logging Test Suite ---\n")
    db = get_db()
    prop_id = "prop_test_behalf"
    user_a = {"id": "user_a", "_id": "user_a", "email": "a@test.com", "name": "Alice", "role": "user"}
    user_b = {"id": "user_b", "_id": "user_b", "email": "b@test.com", "name": "Bob", "role": "user"}

    await db.properties.delete_many({"_id": prop_id})
    await db.expenses.delete_many({"propertyId": prop_id})
    await db.notifications.delete_many({"propertyId": prop_id})

    await db.properties.insert_one({
        "_id": prop_id,
        "name": "Trip to Manali",
        "location": "Manali",
        "managers": ["user_a", "user_b"],
        "managerDetails": [
            {"id": "user_a", "name": "Alice", "email": "a@test.com"},
            {"id": "user_b", "name": "Bob", "email": "b@test.com"},
        ],
    })

    # Act as User A (Alice)
    app.dependency_overrides[get_current_user] = lambda: user_a

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Alice logs an expense on behalf of Bob for ₹2,000 (split 50/50)
        res = await ac.post(
            "/api/expenses",
            json={
                "propertyId": prop_id,
                "title": "Cabin Stay",
                "amount": 2000.0,
                "category": "Rent / Stay",
                "paidBy": "user_b",
                "payerName": "Bob",
                "splitAmong": ["user_a", "user_b"],
                "sharePerPerson": 1000.0,
            },
        )
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["paidBy"] == "user_b"
        assert data["payerName"] == "Bob"
        assert data["loggedBy"] == "user_a"
        assert data["loggedByName"] == "Alice"
        assert data["sharePerPerson"] == 1000.0
        exp_id = data["id"]
        print("  -> PASS: Expense recorded with paidBy=Bob and loggedBy=Alice")

        # Check notification
        notifs = await db.notifications.find({"propertyId": prop_id}).to_list(10)
        assert len(notifs) >= 1
        assert "on behalf of Bob" in notifs[0]["body"]
        print("  -> PASS: Notification correctly notifies co-managers: " + notifs[0]["body"])

        # Check ledger balance: Alice owes Bob ₹1,000, so Alice's net is -1000.0
        bal_res = await ac.get(f"/api/settlements/balances?propertyId={prop_id}")
        assert bal_res.status_code == 200
        bal = bal_res.json()
        assert bal["currentUserNet"] == -1000.0
        assert bal["totalExpenses"] == 2000.0
        assert any(o["userId"] == "user_b" and o["amount"] == 1000.0 for o in bal["peopleUserOwes"])
        print("  -> PASS: Ledger double-entry math correctly credits Bob (+₹1,000) and debts Alice (-₹1,000)")

        # Alice (who logged on behalf) can delete within 5 mins
        del_res = await ac.delete(f"/api/expenses/{exp_id}")
        assert del_res.status_code == 200
        assert del_res.json()["status"] == "deleted"
        print("  -> PASS: Alice (loggedBy) can directly delete expense within 5 mins grace period")

    # Cleanup
    app.dependency_overrides.clear()
    await db.properties.delete_many({"_id": prop_id})
    await db.expenses.delete_many({"propertyId": prop_id})
    await db.notifications.delete_many({"propertyId": prop_id})
    print("\n[SUCCESS] ALL ON-BEHALF LOGGING TESTS PASSED PERFECTLY!\n")

if __name__ == "__main__":
    asyncio.run(run_on_behalf_tests())
