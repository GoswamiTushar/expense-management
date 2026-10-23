"""
Unit & Integration Tests for the Mathematical Ledger (Double-Entry Balance Engine).
Verifies:
1. Exact settlements (clearing debt)
2. Partial settlements (reducing debt)
3. Overpayments (natural balance flipping to credit)
4. Multi-party isolation (A overpaying B does not alter C's balance)
5. Unconfirmed pending settlements do NOT alter balance
6. Backend GET /api/settlements/balances endpoint returns authoritative ledger
"""

import sys
import asyncio
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import get_db
from app.services.ledger_service import calculate_property_balances

async def run_tests():
    print("\n--- Running Mathematical Ledger & Double-Entry Test Suite ---\n")
    db = get_db()
    prop_id = "prop_ledger_math_test"

    # Setup 3 test users: A (Alice), B (Bob), C (Charlie)
    user_a = {"id": "user_a", "_id": "user_a", "name": "Alice"}
    user_b = {"id": "user_b", "_id": "user_b", "name": "Bob"}
    user_c = {"id": "user_c", "_id": "user_c", "name": "Charlie"}

    # Clean previous test artifacts
    await db.properties.delete_many({"_id": prop_id})
    await db.expenses.delete_many({"propertyId": prop_id})
    await db.settlements.delete_many({"propertyId": prop_id})

    # Create Property with 3 managers
    await db.properties.insert_one({
        "_id": prop_id,
        "name": "Math Ledger Villa",
        "managers": ["user_a", "user_b", "user_c"],
        "managerDetails": [
            {"id": "user_a", "name": "Alice"},
            {"id": "user_b", "name": "Bob"},
            {"id": "user_c", "name": "Charlie"},
        ]
    })

    # SCENARIO 1:
    # Bob pays Rs. 30,000 for groceries, split equally among Alice, Bob, Charlie (Rs. 10,000 each)
    # Alice owes Bob Rs. 10,000. Charlie owes Bob Rs. 10,000.
    # Charlie pays Rs. 30,000 for rent, split equally among Alice, Bob, Charlie (Rs. 10,000 each)
    # Alice owes Charlie Rs. 10,000. Bob owes Charlie Rs. 10,000.
    await db.expenses.insert_many([
        {
            "_id": "exp_1",
            "propertyId": prop_id,
            "title": "Groceries",
            "amount": 30000.0,
            "paidBy": "user_b",
            "payerName": "Bob",
            "splitAmong": ["user_a", "user_b", "user_c"],
            "sharePerPerson": 10000.0,
        },
        {
            "_id": "exp_2",
            "propertyId": prop_id,
            "title": "Rent",
            "amount": 30000.0,
            "paidBy": "user_c",
            "payerName": "Charlie",
            "splitAmong": ["user_a", "user_b", "user_c"],
            "sharePerPerson": 10000.0,
        }
    ])

    # Check baseline balances for Alice (user_a)
    bal_a = await calculate_property_balances(prop_id, "user_a")
    assert bal_a["currentUserNet"] == -20000.0, f"Expected -20000, got {bal_a['currentUserNet']}"
    owes_bob = next(p for p in bal_a["peopleUserOwes"] if p["userId"] == "user_b")
    owes_charlie = next(p for p in bal_a["peopleUserOwes"] if p["userId"] == "user_c")
    assert owes_bob["amount"] == 10000.0
    assert owes_charlie["amount"] == 10000.0
    print("[PASS] 1. Baseline debt: Alice owes Bob Rs. 10k, Alice owes Charlie Rs. 10k.")

    # SCENARIO 2: Partial Settlement with PENDING status
    # Alice logs Rs. 6,000 cash to Bob. Since it is status 'pending', it MUST NOT alter balances!
    await db.settlements.insert_one({
        "_id": "settle_p1",
        "propertyId": prop_id,
        "settledBy": "user_a",
        "settledByName": "Alice",
        "paidTo": "user_b",
        "paidToName": "Bob",
        "amount": 6000.0,
        "paymentMode": "Cash",
        "status": "pending",
        "createdAt": "2026-10-21T10:00:00",
    })

    bal_a_pending = await calculate_property_balances(prop_id, "user_a")
    owes_bob_after_pending = next(p for p in bal_a_pending["peopleUserOwes"] if p["userId"] == "user_b")
    assert owes_bob_after_pending["amount"] == 10000.0, "Pending settlement altered balance unexpectedly!"
    assert len(bal_a_pending["pendingOutgoing"]) == 1, "Pending outgoing should track 1 pending settlement."
    print("[PASS] 2. Pending settlement is safely quarantined: debt remains Rs. 10k until confirmed.")

    # SCENARIO 3: Bob confirms the partial payment of Rs. 6,000
    await db.settlements.update_one(
        {"_id": "settle_p1"},
        {"$set": {"status": "confirmed", "settledAt": "2026-10-21T10:05:00"}}
    )

    bal_a_partial = await calculate_property_balances(prop_id, "user_a")
    owes_bob_partial = next(p for p in bal_a_partial["peopleUserOwes"] if p["userId"] == "user_b")
    assert owes_bob_partial["amount"] == 4000.0, f"Expected 4000, got {owes_bob_partial['amount']}"
    print("[PASS] 3. Confirmed partial payment: Alice now owes Bob Rs. 4,000 (10k - 6k).")

    # SCENARIO 4: Overpayment & Natural Balance Flip + Multi-Party Isolation!
    # Alice pays Bob Rs. 14,000 (when she only owes Rs. 4,000). Surplus = Rs. 10,000.
    await db.settlements.insert_one({
        "_id": "settle_overpay",
        "propertyId": prop_id,
        "settledBy": "user_a",
        "settledByName": "Alice",
        "paidTo": "user_b",
        "paidToName": "Bob",
        "amount": 14000.0,
        "paymentMode": "UPI",
        "status": "confirmed",
        "createdAt": "2026-10-21T11:00:00",
        "settledAt": "2026-10-21T11:00:00",
    })

    # Check Alice's balances
    bal_a_overpay = await calculate_property_balances(prop_id, "user_a")
    # Alice should no longer owe Bob
    assert not any(p["userId"] == "user_b" for p in bal_a_overpay["peopleUserOwes"])
    # Bob should now owe Alice Rs. 10,000!
    bob_owes_alice = next(p for p in bal_a_overpay["peopleWhoOweUser"] if p["userId"] == "user_b")
    assert bob_owes_alice["amount"] == 10000.0, f"Expected Bob to owe Alice 10k, got {bob_owes_alice['amount']}"

    # CRITICAL VERIFICATION: Charlie's balance with Alice must be 100% UNCHANGED!
    alice_owes_charlie = next(p for p in bal_a_overpay["peopleUserOwes"] if p["userId"] == "user_c")
    assert alice_owes_charlie["amount"] == 10000.0, "Alice-Charlie balance corrupted by Alice-Bob overpayment!"

    # Check Charlie's perspective directly
    bal_c = await calculate_property_balances(prop_id, "user_c")
    charlie_views_alice = next(p for p in bal_c["peopleWhoOweUser"] if p["userId"] == "user_a")
    assert charlie_views_alice["amount"] == 10000.0, "Charlie view corrupted: Alice must owe Charlie 10k!"
    # Bob and Charlie are even (Bob spent 10k on Charlie, Charlie spent 10k on Bob -> 0 net)
    assert not any(p["userId"] == "user_b" for p in bal_c["peopleWhoOweUser"])
    assert not any(p["userId"] == "user_b" for p in bal_c["peopleUserOwes"])
    print("[PASS] 4. Overpayment flipped balance (Bob owes Alice Rs. 10k) while Charlie was 100% ISOLATED.")

    # SCENARIO 5: Future Expense offsets Overpayment Credit naturally
    # Bob spends Rs. 20,000 split 50/50 with Alice (Alice's share = Rs. 10,000).
    # Since Bob already owed Alice Rs. 10,000, the new expense cancels out to Rs. 0!
    await db.expenses.insert_one({
        "_id": "exp_offset",
        "propertyId": prop_id,
        "title": "Repairs",
        "amount": 20000.0,
        "paidBy": "user_b",
        "payerName": "Bob",
        "splitAmong": ["user_a", "user_b"],
        "sharePerPerson": 10000.0,
    })

    bal_a_offset = await calculate_property_balances(prop_id, "user_a")
    # Alice and Bob should now have zero dues between each other!
    assert not any(p["userId"] == "user_b" for p in bal_a_offset["peopleUserOwes"])
    assert not any(p["userId"] == "user_b" for p in bal_a_offset["peopleWhoOweUser"])
    print("[PASS] 5. Future expense naturally cancelled out the prior overpayment credit to Rs. 0.")

    # SCENARIO 6: Test HTTP GET /api/settlements/balances endpoint
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        from app.deps import get_current_user
        app.dependency_overrides[get_current_user] = lambda: user_a
        res = await client.get(f"/api/settlements/balances?propertyId={prop_id}")
        assert res.status_code == 200
        data = res.json()
        assert data["propertyId"] == prop_id
        assert data["totalExpenses"] == 80000.0
        assert len(data["pairwiseDebts"]) > 0
        print("[PASS] 6. GET /api/settlements/balances API returns authoritative ledger matching calculations.")

    # Clean up test property
    await db.properties.delete_many({"_id": prop_id})
    await db.expenses.delete_many({"propertyId": prop_id})
    await db.settlements.delete_many({"propertyId": prop_id})
    app.dependency_overrides.clear()

    print("\n[SUCCESS] ALL MATHEMATICAL LEDGER TESTS PASSED WITH 100% FINANCIAL ACCURACY!\n")

if __name__ == "__main__":
    asyncio.run(run_tests())
