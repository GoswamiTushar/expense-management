"""
Unit & Integration Tests for Group / Property Archive & Unarchive Functionality.
Tests:
1. Member can archive group (isArchived=True, archivedAt, archivedBy set).
2. Member can unarchive group (isArchived=False, fields reset).
3. Non-member user is rejected with 403 Forbidden.
4. Admin can archive and unarchive any group.
"""

import sys
import asyncio
from datetime import datetime
from httpx import AsyncClient, ASGITransport

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app.main import app
from app.database import get_db
from app.deps import get_current_user

async def run_archive_tests():
    print("\n--- Running Group Archive & Unarchive Test Suite ---")
    db = get_db()

    # Setup mock users
    user_a = {"_id": "usr_arch_a", "id": "usr_arch_a", "name": "Alice", "email": "alice@test.com", "role": "manager", "initials": "AL", "color": "#10B981"}
    user_b = {"_id": "usr_arch_b", "id": "usr_arch_b", "name": "Bob", "email": "bob@test.com", "role": "manager", "initials": "BO", "color": "#6366F1"}
    user_outsider = {"_id": "usr_arch_outsider", "id": "usr_arch_outsider", "name": "Carl", "email": "carl@test.com", "role": "manager", "initials": "CA", "color": "#F59E0B"}
    user_admin = {"_id": "usr_arch_admin", "id": "usr_arch_admin", "name": "Dave", "email": "dave@test.com", "role": "admin", "initials": "DA", "color": "#EF4444"}

    user_ids = ["usr_arch_a", "usr_arch_b", "usr_arch_outsider", "usr_arch_admin"]
    prop_id = "prop_archive_test_1"

    await db.users.delete_many({"_id": {"$in": user_ids}})
    await db.users.insert_many([user_a, user_b, user_outsider, user_admin])

    await db.properties.delete_one({"_id": prop_id})
    prop = {
        "_id": prop_id,
        "name": "Goa Trip 2026",
        "location": "North Goa",
        "managers": ["usr_arch_a", "usr_arch_b"],
        "createdAt": datetime.utcnow().isoformat(),
        "isArchived": False,
    }
    await db.properties.insert_one(prop)

    transport = ASGITransport(app=app)
    try:
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Member Alice archives the group
            app.dependency_overrides[get_current_user] = lambda: user_a
            res = await client.patch(f"/api/properties/{prop_id}/archive", json={"isArchived": True})
            assert res.status_code == 200, f"Archive failed: {res.text}"
            data = res.json()
            assert data["isArchived"] is True
            assert data["archivedBy"] == "usr_arch_a"
            assert data["archivedAt"] is not None
            print("  ✓ Member Alice successfully archived group")

            # 2. Non-member Carl tries to modify archive state -> 403 Forbidden
            app.dependency_overrides[get_current_user] = lambda: user_outsider
            res_forbidden = await client.patch(f"/api/properties/{prop_id}/archive", json={"isArchived": False})
            assert res_forbidden.status_code == 403, f"Expected 403, got: {res_forbidden.status_code}"
            print("  ✓ Non-member correctly rejected with 403 Forbidden")

            # 3. Member Bob unarchives the group
            app.dependency_overrides[get_current_user] = lambda: user_b
            res_unarchive = await client.patch(f"/api/properties/{prop_id}/archive", json={"isArchived": False})
            assert res_unarchive.status_code == 200, f"Unarchive failed: {res_unarchive.text}"
            data_unarchived = res_unarchive.json()
            assert data_unarchived["isArchived"] is False
            assert data_unarchived["archivedAt"] is None
            assert data_unarchived["archivedBy"] is None
            print("  ✓ Member Bob successfully unarchived group")

            # 4. Admin Dave can archive
            app.dependency_overrides[get_current_user] = lambda: user_admin
            res_admin = await client.patch(f"/api/properties/{prop_id}/archive", json={"isArchived": True})
            assert res_admin.status_code == 200, f"Admin archive failed: {res_admin.text}"
            assert res_admin.json()["isArchived"] is True
            print("  ✓ Admin successfully archived group")

            print("✓ All Group Archive & Unarchive tests passed successfully!\n")
    finally:
        app.dependency_overrides.clear()
        await db.properties.delete_one({"_id": prop_id})
        await db.users.delete_many({"_id": {"$in": user_ids}})

if __name__ == "__main__":
    asyncio.run(run_archive_tests())
