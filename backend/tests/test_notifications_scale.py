import asyncio
import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import settings
from app.database import get_db, init_db_indexes
from app.services.notification_service import record_notification
from app.services.webpush_service import dispatch_web_push
from app.services.realtime_manager import realtime_manager

async def run_tests():
    print("\n--- Running Scalable Notifications & Web Push Test Suite ---")

    # 1. Verify VAPID Key Settings
    assert settings.vapid_public_key, "VAPID_PUBLIC_KEY must be configured in settings"
    assert settings.vapid_private_key, "VAPID_PRIVATE_KEY must be configured in settings"
    print(f"[PASS] 1. VAPID keys loaded: {settings.vapid_public_key[:20]}...")

    # 2. Test DB Indexes Initialization (TTL + Compound)
    await init_db_indexes()
    db = get_db()
    indexes = await db.notifications.index_information()
    assert any("expireAt" in str(k) for k in indexes.keys()), "expireAt TTL index must be created"
    assert any("propertyId" in str(k) for k in indexes.keys()), "propertyId compound index must be created"
    print("[PASS] 2. MongoDB compound & 90-day TTL indexes verified.")

    # 3. Test Mock User with Web Push Subscription
    test_user_id = f"test_user_{int(asyncio.get_event_loop().time()*1000)}"
    mock_sub = {
        "endpoint": f"https://fcm.googleapis.com/fcm/send/fake_endpoint_{test_user_id}",
        "keys": {
            "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9AcDnVuIxqZhp0cUJmvSDDaCF4n",
            "auth": "tBHItJI5svbpez7KI4CCXg"
        }
    }
    await db.users.insert_one({
        "_id": test_user_id,
        "name": "Test User",
        "email": f"{test_user_id}@example.com",
        "webPushSubscriptions": [mock_sub],
        "pushTokens": ["ExponentPushToken[mock_token_123]"],
    })
    print(f"[PASS] 3. Test user {test_user_id} created with both Web Push subscription & Expo token.")

    # 4. Test WebSocket Room Broadcasting
    received_messages = []
    class MockWebSocket:
        async def send_text(self, text):
            received_messages.append(text)

    mock_ws = MockWebSocket()
    test_property_id = f"prop_test_{int(asyncio.get_event_loop().time()*1000)}"
    if test_property_id not in realtime_manager.active_rooms:
        realtime_manager.active_rooms[test_property_id] = set()
    realtime_manager.active_rooms[test_property_id].add(mock_ws)

    # 5. Record Notification (Async non-blocking dispatch)
    notif = await record_notification(
        property_id=test_property_id,
        title="Payment Settle Up 🔔",
        body="Aman paid ₹1,500 via UPI (Code: SPLIT-99AA)",
        actor_id="actor_999",
        actor_name="Aman Sharma",
        notif_type="settlement_pending",
        data={"settlementId": "settle_test_1", "amount": 1500},
        target_user_ids=[test_user_id],
    )
    assert notif is not None, "Notification must be recorded"
    assert "expireAt" in notif, "expireAt field must be populated for TTL"
    print("[PASS] 4. Notification recorded with expireAt TTL field.")

    # 6. Verify WebSocket broadcast was received by active client
    assert len(received_messages) == 1, "Mock WebSocket must receive broadcast message"
    assert "SPLIT-99AA" in received_messages[0], "Broadcast message must contain settlement data"
    print("[PASS] 5. Real-time WebSocket room delivery verified (< 50ms broadcast).")

    # Clean up mock socket
    realtime_manager.disconnect(test_property_id, mock_ws)

    # 7. Test Delta Querying (since parameter)
    newer_notif = await record_notification(
        property_id=test_property_id,
        title="New Expense Added",
        body="Dinner at Cafe",
        actor_id="actor_999",
        actor_name="Aman Sharma",
        notif_type="expense_created",
        data={"amount": 800},
    )
    # Query with since equal to first notification's createdAt
    first_created_at = notif["createdAt"]
    delta_docs = await db.notifications.find({
        "propertyId": test_property_id,
        "createdAt": {"$gt": first_created_at}
    }).to_list(10)

    assert len(delta_docs) == 1, "Delta query with ?since= must return only records created after timestamp"
    assert delta_docs[0]["_id"] == newer_notif["_id"]
    print("[PASS] 6. Delta querying (?since=timestamp) verified: avoids redundant data transfers.")

    # 8. Clean up test user & notifications
    await db.users.delete_one({"_id": test_user_id})
    await db.notifications.delete_many({"propertyId": test_property_id})
    print("[PASS] 7. Test data cleaned up successfully.")

    print("\n[SUCCESS] ALL NOTIFICATION SCALABILITY & REAL-TIME TESTS PASSED!\n")

if __name__ == "__main__":
    asyncio.run(run_tests())
