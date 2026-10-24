"""
Automated Integration Tests for Settlements API Lifecycle.
Tests run against local Docker MongoDB (airbnb_expenses_dev).
"""

import sys
import asyncio
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import get_db

async def run_tests():
    print("\n--- Running Settlements API Test Suite ---\n")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Mock users
        user_a = {"id": "user_a_test", "_id": "user_a_test", "name": "Alice"}
        user_b = {"id": "user_b_test", "_id": "user_b_test", "name": "Bob"}
        prop_id = "prop_settle_test"

        # Setup test property in local DB
        await get_db().properties.delete_many({"_id": prop_id})
        await get_db().settlements.delete_many({"propertyId": prop_id})
        await get_db().properties.insert_one({
            "_id": prop_id,
            "name": "Test Villa",
            "managers": ["user_a_test", "user_b_test"],
        })

        # Override dependency for authentication as User A
        from app.deps import get_current_user
        app.dependency_overrides[get_current_user] = lambda: user_a

        # 1. Test invalid amount <= 0
        res = await client.post("/api/settlements", json={
            "propertyId": prop_id,
            "settledBy": "user_a_test",
            "settledByName": "Alice",
            "paidTo": "user_b_test",
            "paidToName": "Bob",
            "amount": -500,
            "paymentMode": "Cash",
        })
        assert res.status_code == 422 or res.status_code == 400, f"Expected 400/422, got {res.status_code}"
        print("[PASS] 1. Invalid amount correctly rejected.")

        # 2. Test User A records payment to User B -> should be status 'pending'
        res = await client.post("/api/settlements", json={
            "propertyId": prop_id,
            "settledBy": "user_a_test",
            "settledByName": "Alice",
            "paidTo": "user_b_test",
            "paidToName": "Bob",
            "amount": 10000.0,
            "paymentMode": "Cash",
            "notes": "10k handed in cash",
        })
        assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
        data1 = res.json()
        settle_id = data1["id"]
        assert data1["status"] == "pending", f"Expected 'pending', got {data1['status']}"
        assert data1["amount"] == 10000.0
        assert data1["settledAt"] is None
        assert len(data1["auditLog"]) == 1
        assert data1["auditLog"][0]["action"] == "created"
        print(f"[PASS] 2. User A recorded Rs. 10,000 cash payment -> Status: 'pending'. Settlement ID: {settle_id}")

        # 3. Test list settlements (filtered by property)
        res = await client.get(f"/api/settlements?propertyId={prop_id}")
        assert res.status_code == 200
        items = res.json()
        assert len(items) == 1
        assert items[0]["id"] == settle_id
        print(f"[PASS] 3. GET /api/settlements returned {len(items)} items for property.")

        # 4. User B confirms receipt
        app.dependency_overrides[get_current_user] = lambda: user_b
        res = await client.patch(f"/api/settlements/{settle_id}/confirm")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        confirmed_data = res.json()
        assert confirmed_data["status"] == "confirmed"
        assert confirmed_data["settledAt"] is not None
        assert confirmed_data["confirmedBy"] == "user_b_test"
        assert len(confirmed_data["auditLog"]) == 2
        assert confirmed_data["auditLog"][1]["action"] == "confirmed"
        print("[PASS] 4. User B confirmed receipt -> Status: 'confirmed', settledAt populated.")

        # 5. Idempotent confirmation
        res = await client.patch(f"/api/settlements/{settle_id}/confirm")
        assert res.status_code == 200
        assert res.json()["status"] == "confirmed"
        print("[PASS] 5. Repeated confirm is safely idempotent.")

        # 6. Test User A creates a second settlement for Rs. 5,000 via UPI
        app.dependency_overrides[get_current_user] = lambda: user_a
        res = await client.post("/api/settlements", json={
            "propertyId": prop_id,
            "settledBy": "user_a_test",
            "settledByName": "Alice",
            "paidTo": "user_b_test",
            "paidToName": "Bob",
            "amount": 5000.0,
            "paymentMode": "UPI",
            "notes": "UPI reference #123456",
        })
        assert res.status_code == 201
        settle_id_2 = res.json()["id"]

        # 7. User B rejects the second settlement with reason
        app.dependency_overrides[get_current_user] = lambda: user_b
        res = await client.patch(f"/api/settlements/{settle_id_2}/reject", json={
            "reason": "Money not credited to bank account"
        })
        assert res.status_code == 200
        rejected_data = res.json()
        assert rejected_data["status"] == "rejected"
        assert rejected_data["rejectionReason"] == "Money not credited to bank account"
        assert len(rejected_data["auditLog"]) == 2
        assert rejected_data["auditLog"][1]["action"] == "rejected"
        print("[PASS] 6 & 7. Settlement rejection flow verified with audit reason.")

        # 8. Attempting to confirm a rejected settlement should fail
        res = await client.patch(f"/api/settlements/{settle_id_2}/confirm")
        assert res.status_code == 400
        print("[PASS] 8. Confirming rejected settlement correctly blocked with 400.")

        # 9. Direct receipt recording: Creditor (User B) logs receiving Rs. 2,000 cash from Alice
        res = await client.post("/api/settlements", json={
            "propertyId": prop_id,
            "settledBy": "user_a_test",
            "settledByName": "Alice",
            "paidTo": "user_b_test",
            "paidToName": "Bob",
            "amount": 2000.0,
            "paymentMode": "Cash",
            "notes": "Alice handed 2k cash directly to Bob",
        })
        assert res.status_code == 201
        direct_data = res.json()
        assert direct_data["status"] == "confirmed"
        assert direct_data["confirmedBy"] == "user_b_test"
        print("[PASS] 9. Direct receipt recorded by receiver automatically confirmed.")

        # 10. UPI settlement with explicit verificationCode
        app.dependency_overrides[get_current_user] = lambda: user_a
        res = await client.post("/api/settlements", json={
            "propertyId": prop_id,
            "settledBy": "user_a_test",
            "settledByName": "Alice",
            "paidTo": "user_b_test",
            "paidToName": "Bob",
            "amount": 1500.0,
            "paymentMode": "UPI",
            "verificationCode": "SPLIT-7K9X",
            "notes": "Settled lunch",
        })
        assert res.status_code == 201
        upi_data = res.json()
        assert upi_data["status"] == "pending"
        assert upi_data["verificationCode"] == "SPLIT-7K9X"
        print("[PASS] 10. UPI settlement with explicit verificationCode 'SPLIT-7K9X' preserved.")

        # 11. UPI settlement without verificationCode auto-generates SPLIT-XXXX code
        res = await client.post("/api/settlements", json={
            "propertyId": prop_id,
            "settledBy": "user_a_test",
            "settledByName": "Alice",
            "paidTo": "user_b_test",
            "paidToName": "Bob",
            "amount": 750.0,
            "paymentMode": "UPI",
        })
        assert res.status_code == 201
        auto_upi_data = res.json()
        assert auto_upi_data["status"] == "pending"
        assert auto_upi_data["verificationCode"] is not None
        assert auto_upi_data["verificationCode"].startswith("SPLIT-")
        print(f"[PASS] 11. UPI settlement auto-generated verification code '{auto_upi_data['verificationCode']}'.")

        # Clean up test artifacts in local DB
        await get_db().properties.delete_many({"_id": prop_id})
        await get_db().settlements.delete_many({"propertyId": prop_id})

        # Clear overrides
        app.dependency_overrides.clear()
        print("\n[SUCCESS] ALL SETTLEMENT API TESTS PASSED SUCCESSFULLY!\n")

if __name__ == "__main__":
    asyncio.run(run_tests())
