"""
Exhaustive Automated Test Suite: Expense Deletion & Approval Workflow
Validates all constraints of the two-tier expense soft-deletion system:
1. Direct soft delete under 5 minutes from creation.
2. Approval required from co-managers over 5 minutes from creation.
3. Requester blocked from self-approving (403 Forbidden).
4. Co-manager approval permanently soft deletes and zeroes ledger impact.
5. Co-manager rejection keeps expense active.
6. Requester cancellation.
7. Admin override permissions.
8. Backward compatibility with legacy documents without delete columns or with 'Y' flags.
9. Complete exclusion from ledger, balance calculations, and expense listing APIs.
"""

import sys
import asyncio
from datetime import datetime, timedelta
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import get_db
from app.services.ledger_service import calculate_property_balances
from app.routers.expenses import (
    create_expense,
    update_expense,
    delete_expense,
    approve_delete_expense,
    reject_delete_expense,
    cancel_delete_request,
    list_expenses,
    list_expenses_paginated,
)
from app.models.expense import ExpenseCreate, ExpenseUpdate, DeleteExpenseRequest, RejectDeleteRequest

async def run_tests():
    print("  [Deletion Tests] Initializing test database connection...")
    db = get_db()

    # Setup isolated test property and test managers
    test_prop_id = f"test_prop_del_{int(datetime.utcnow().timestamp())}"
    user_tushar = {"_id": "u_del_tushar", "id": "u_del_tushar", "name": "Tushar Goswami", "role": "user", "email": "tushar@test.com"}
    user_rashi = {"_id": "u_del_rashi", "id": "u_del_rashi", "name": "Rashi", "role": "user", "email": "rashi@test.com"}
    user_joy = {"_id": "u_del_joy", "id": "u_del_joy", "name": "Joy", "role": "user", "email": "joy@test.com"}
    user_admin = {"_id": "u_del_admin", "id": "u_del_admin", "name": "Admin Root", "role": "admin", "email": "admin@test.com"}
    user_stranger = {"_id": "u_del_stranger", "id": "u_del_stranger", "name": "Stranger", "role": "user", "email": "stranger@test.com"}

    for u in [user_tushar, user_rashi, user_joy, user_admin, user_stranger]:
        await db.users.update_one({"_id": u["_id"]}, {"$set": u}, upsert=True)

    test_prop = {
        "_id": test_prop_id,
        "name": "Deletion Test Villa",
        "location": "Goa Beachfront",
        "managers": ["u_del_tushar", "u_del_rashi", "u_del_joy"],
        "managerDetails": [
            {"id": "u_del_tushar", "name": "Tushar Goswami", "email": "tushar@test.com"},
            {"id": "u_del_rashi", "name": "Rashi", "email": "rashi@test.com"},
            {"id": "u_del_joy", "name": "Joy", "email": "joy@test.com"},
        ],
    }
    await db.properties.insert_one(test_prop)

    try:
        # -------------------------------------------------------------
        # TEST 1: Direct deletion <= 5 minutes from creation
        # -------------------------------------------------------------
        print("\n  [Test 1] Logging expense and directly deleting under 5 minutes...")
        exp1_payload = ExpenseCreate(
            propertyId=test_prop_id,
            title="Fresh Test Coffee",
            amount=300.0,
            category="Food",
            paidBy="u_del_tushar",
            splitAmong=["u_del_tushar", "u_del_rashi", "u_del_joy"],
            sharePerPerson=100.0,
        )
        exp1_res = await create_expense(exp1_payload, current_user=user_tushar)
        exp1_id = exp1_res.id

        # Verify balance before deletion (Tushar paid 300, Rashi and Joy each owe 100)
        bal_before = await calculate_property_balances(test_prop_id, current_user_id="u_del_tushar")
        assert bal_before["currentUserNet"] == 200.0, f"Expected net 200, got {bal_before['currentUserNet']}"

        # Tushar immediately deletes within 5 minutes
        del1_res = await delete_expense(
            expense_id=exp1_id,
            payload=DeleteExpenseRequest(reason="Accidental duplicate coffee"),
            current_user=user_tushar,
        )
        assert del1_res["status"] == "deleted", f"Expected 'deleted', got {del1_res['status']}"

        # Verify DB record is soft deleted
        exp1_db = await db.expenses.find_one({"_id": exp1_id})
        assert exp1_db["isDeleted"] is True
        assert exp1_db["deleteStatus"] == "deleted"
        assert exp1_db["deletedBy"] == "u_del_tushar"

        # Verify ledger reverts completely to 0.0
        bal_after = await calculate_property_balances(test_prop_id, current_user_id="u_del_tushar")
        assert bal_after["currentUserNet"] == 0.0, f"Expected 0 net after deletion, got {bal_after['currentUserNet']}"

        # Verify listing excludes soft-deleted expense
        active_list = await list_expenses(propertyId=test_prop_id, current_user=user_tushar)
        assert not any(e.id == exp1_id for e in active_list), "Soft-deleted expense must not appear in list_expenses"

        paginated = await list_expenses_paginated(propertyId=test_prop_id, current_user=user_tushar)
        assert not any(e.id == exp1_id for e in paginated.items), "Soft-deleted expense must not appear in paginated expenses"
        print("    -> PASS: Under 5 mins direct deletion works, soft-deletes at DB, zero ledger impact.")

        # -------------------------------------------------------------
        # TEST 2: Over 5 mins -> requires co-manager approval
        # -------------------------------------------------------------
        print("\n  [Test 2] Expense logged > 5 minutes ago requires co-manager approval...")
        # Create expense and backdate its creation timestamp to 10 minutes ago
        exp2_payload = ExpenseCreate(
            propertyId=test_prop_id,
            title="Old Electric Repair",
            amount=900.0,
            category="Repairs",
            paidBy="u_del_tushar",
            splitAmong=["u_del_tushar", "u_del_rashi", "u_del_joy"],
            sharePerPerson=300.0,
        )
        exp2_res = await create_expense(exp2_payload, current_user=user_tushar)
        exp2_id = exp2_res.id

        ten_mins_ago = (datetime.utcnow() - timedelta(minutes=10)).isoformat() + "Z"
        await db.expenses.update_one({"_id": exp2_id}, {"$set": {"createdAt": ten_mins_ago, "date": ten_mins_ago}})

        # Attempt deletion by creator -> should NOT directly delete, but trigger pending_approval
        del2_req = await delete_expense(
            expense_id=exp2_id,
            payload=DeleteExpenseRequest(reason="Entered test repair instead of actual bill"),
            current_user=user_tushar,
        )
        assert del2_req["status"] == "pending_approval", f"Expected 'pending_approval', got {del2_req['status']}"

        # Expense should still be active in DB (not isDeleted: True)
        exp2_db = await db.expenses.find_one({"_id": exp2_id})
        assert exp2_db.get("isDeleted") is not True
        assert exp2_db.get("deleteStatus") == "pending_approval"
        assert exp2_db.get("deleteRequestedBy") == "u_del_tushar"

        # Expense CANNOT be edited while deletion is pending
        try:
            await update_expense(exp2_id, ExpenseUpdate(title="Hacked Title"), current_user=user_tushar)
            assert False, "Should have raised 400 when editing expense with pending deletion"
        except Exception as e:
            assert "pending deletion request" in str(e).lower() or e.status_code == 400

        # Creator CANNOT self-approve (Self-Approval Protection)
        try:
            await approve_delete_expense(exp2_id, current_user=user_tushar)
            assert False, "Should have raised 403 Forbidden for self-approval"
        except Exception as e:
            assert "cannot approve your own deletion request" in str(e).lower() or getattr(e, 'status_code', None) == 403

        # Non-manager stranger CANNOT approve
        try:
            await approve_delete_expense(exp2_id, current_user=user_stranger)
            assert False, "Should have raised 403 Forbidden for non-manager approval"
        except Exception as e:
            assert getattr(e, 'status_code', None) == 403

        print("    -> PASS: Over 5 mins requires approval, self-approval blocked (403), stranger blocked (403), editing locked.")

        # -------------------------------------------------------------
        # TEST 3: Requester can cancel pending deletion
        # -------------------------------------------------------------
        print("\n  [Test 3] Requester cancels pending deletion request...")
        cancel_res = await cancel_delete_request(exp2_id, current_user=user_tushar)
        assert cancel_res["status"] == "active"
        exp2_db = await db.expenses.find_one({"_id": exp2_id})
        assert exp2_db.get("deleteStatus") is None

        # Re-request deletion
        del2_req2 = await delete_expense(
            expense_id=exp2_id,
            payload=DeleteExpenseRequest(reason="Please delete, definitely wrong"),
            current_user=user_tushar,
        )
        assert del2_req2["status"] == "pending_approval"
        print("    -> PASS: Cancellation restores active status cleanly.")

        # -------------------------------------------------------------
        # TEST 4: Co-manager rejects deletion request
        # -------------------------------------------------------------
        print("\n  [Test 4] Co-manager rejects deletion request...")
        reject_res = await reject_delete_expense(
            exp2_id,
            payload=RejectDeleteRequest(reason="We already paid contractor for this, keep it"),
            current_user=user_rashi,
        )
        assert reject_res["status"] == "active"
        exp2_db = await db.expenses.find_one({"_id": exp2_id})
        assert exp2_db.get("deleteStatus") == "rejected"
        assert exp2_db.get("isDeleted") is not True

        # Expense remains fully in ledger
        bal_with_exp2 = await calculate_property_balances(test_prop_id, current_user_id="u_del_tushar")
        assert bal_with_exp2["currentUserNet"] == 600.0, f"Expected 600 net, got {bal_with_exp2['currentUserNet']}"
        print("    -> PASS: Co-manager rejection keeps expense active with recorded reason.")

        # -------------------------------------------------------------
        # TEST 5: Co-manager approves deletion request
        # -------------------------------------------------------------
        print("\n  [Test 5] Co-manager approves deletion request...")
        # Reset to pending_approval
        await db.expenses.update_one({"_id": exp2_id}, {"$set": {"deleteStatus": "pending_approval"}})

        # Rashi (co-manager) approves deletion
        appr_res = await approve_delete_expense(exp2_id, current_user=user_rashi)
        assert appr_res["status"] == "deleted"

        # Verify soft-delete flags in DB
        exp2_db = await db.expenses.find_one({"_id": exp2_id})
        assert exp2_db["isDeleted"] is True
        assert exp2_db["deleted"] is True
        assert exp2_db["deleteStatus"] == "approved"
        assert exp2_db["deleteApprovedBy"] == "u_del_rashi"

        # Verify zero residual debt in ledger
        bal_after_approval = await calculate_property_balances(test_prop_id, current_user_id="u_del_tushar")
        assert bal_after_approval["currentUserNet"] == 0.0, f"Expected 0 net after approval, got {bal_after_approval['currentUserNet']}"

        # Cannot edit after approval
        try:
            await update_expense(exp2_id, ExpenseUpdate(title="Dead edit"), current_user=user_tushar)
            assert False, "Should fail editing deleted expense"
        except Exception as e:
            assert getattr(e, 'status_code', None) in [400, 404]

        print("    -> PASS: Co-manager approval permanently soft-deletes expense and zeroes ledger balances.")

        # -------------------------------------------------------------
        # TEST 6: Admin override capability
        # -------------------------------------------------------------
        print("\n  [Test 6] Admin can directly delete any expense even if > 5 minutes...")
        exp3_payload = ExpenseCreate(
            propertyId=test_prop_id,
            title="Admin Emergency Expense",
            amount=1500.0,
            category="Maintenance",
            paidBy="u_del_joy",
            splitAmong=["u_del_tushar", "u_del_rashi", "u_del_joy"],
            sharePerPerson=500.0,
        )
        exp3_res = await create_expense(exp3_payload, current_user=user_joy)
        exp3_id = exp3_res.id

        # Backdate to 2 hours ago
        two_hrs_ago = (datetime.utcnow() - timedelta(hours=2)).isoformat() + "Z"
        await db.expenses.update_one({"_id": exp3_id}, {"$set": {"createdAt": two_hrs_ago, "date": two_hrs_ago}})

        # Admin deletes directly
        admin_del_res = await delete_expense(
            expense_id=exp3_id,
            payload=DeleteExpenseRequest(reason="Admin cleanup"),
            current_user=user_admin,
        )
        assert admin_del_res["status"] == "deleted"

        exp3_db = await db.expenses.find_one({"_id": exp3_id})
        assert exp3_db["isDeleted"] is True
        print("    -> PASS: Admin direct override deletion works properly.")

        # -------------------------------------------------------------
        # TEST 7: Backward Compatibility: Legacy documents with missing columns or 'Y'
        # -------------------------------------------------------------
        print("\n  [Test 7] Backward compatibility with legacy documents...")
        # A. Legacy active expense (has no isDeleted or deleted field)
        legacy_active_id = f"exp_legacy_active_{int(datetime.utcnow().timestamp())}"
        await db.expenses.insert_one({
            "_id": legacy_active_id,
            "propertyId": test_prop_id,
            "title": "Legacy Water Can",
            "amount": 120.0,
            "category": "Supplies",
            "paidBy": "u_del_tushar",
            "splitAmong": ["u_del_tushar", "u_del_rashi"],
            "sharePerPerson": 60.0,
            "createdAt": datetime.utcnow().isoformat() + "Z",
        })

        # B. Legacy soft-deleted expense marked with deleted: 'Y'
        legacy_deleted_id = f"exp_legacy_del_{int(datetime.utcnow().timestamp())}"
        await db.expenses.insert_one({
            "_id": legacy_deleted_id,
            "propertyId": test_prop_id,
            "title": "Legacy Deleted Food",
            "amount": 999.0,
            "category": "Food",
            "paidBy": "u_del_rashi",
            "splitAmong": ["u_del_tushar", "u_del_rashi"],
            "sharePerPerson": 499.5,
            "deleted": "Y",
            "createdAt": datetime.utcnow().isoformat() + "Z",
        })

        # Calculate balances: only legacy_active_id (120, Tushar paid, Rashi owes 60) must be included
        bal_legacy = await calculate_property_balances(test_prop_id, current_user_id="u_del_tushar")
        assert bal_legacy["currentUserNet"] == 60.0, f"Expected 60 net from legacy active expense, got {bal_legacy['currentUserNet']}"

        # Fetch expenses list: legacy_deleted_id with deleted='Y' must NEVER appear
        expenses_fetched = await list_expenses(propertyId=test_prop_id, current_user=user_tushar)
        fetched_ids = [e.id for e in expenses_fetched]
        assert legacy_active_id in fetched_ids, "Legacy active expense must appear in list"
        assert legacy_deleted_id not in fetched_ids, "Legacy deleted='Y' expense must NOT appear in list"

        print("    -> PASS: Backward compatibility verified. Legacy active records work, legacy 'Y' records are omitted.")

    finally:
        # Cleanup test property and related expenses
        await db.properties.delete_one({"_id": test_prop_id})
        await db.expenses.delete_many({"propertyId": test_prop_id})
        print("  [Deletion Tests] Cleaned up test property and test expense records.")

if __name__ == "__main__":
    asyncio.run(run_tests())
