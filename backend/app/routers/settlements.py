import time
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_db
from app.models.settlement import (
    SettlementCreate,
    SettlementResponse,
    SettlementRejectRequest,
    SettlementUpdateRequest,
    SettlementAuditEntry,
    PropertyBalanceResponse,
)
from app.deps import get_current_user
from app.services.notification_service import record_notification
from app.services.ledger_service import calculate_property_balances

router = APIRouter(prefix="/api/settlements", tags=["Settlements"])

def _format_settlement_response(doc: dict) -> SettlementResponse:
    return SettlementResponse(
        id=str(doc.get("_id")),
        propertyId=str(doc.get("propertyId", "")),
        settledBy=str(doc.get("settledBy", "")),
        settledByName=doc.get("settledByName") or "Partner",
        paidTo=str(doc.get("paidTo", "")),
        paidToName=doc.get("paidToName") or "Partner",
        amount=round(float(doc.get("amount", 0)), 2),
        paymentMode=doc.get("paymentMode") or "Cash",
        notes=doc.get("notes") or "",
        status=doc.get("status") or "pending",
        initiatedBy=str(doc.get("initiatedBy") or ""),
        createdAt=doc.get("createdAt") or doc.get("settledAt") or "",
        settledAt=doc.get("settledAt"),
        confirmedBy=doc.get("confirmedBy"),
        rejectionReason=doc.get("rejectionReason"),
        auditLog=[
            SettlementAuditEntry(
                action=entry.get("action", "unknown"),
                actorId=str(entry.get("actorId", "")),
                actorName=entry.get("actorName", "Manager"),
                timestamp=entry.get("timestamp", ""),
                notes=entry.get("notes", ""),
            )
            for entry in (doc.get("auditLog") or [])
        ],
    )

@router.get("/balances", response_model=PropertyBalanceResponse)
async def get_property_balances(
    propertyId: str,
    current_user: dict = Depends(get_current_user),
):
    actor_id = str(current_user.get("id") or current_user.get("_id") or "")
    balances = await calculate_property_balances(property_id=propertyId, current_user_id=actor_id)
    return PropertyBalanceResponse(**balances)

from pydantic import BaseModel

class PaginatedSettlementsResponse(BaseModel):
    items: List[SettlementResponse]
    total: int
    skip: int
    limit: int
    hasMore: bool

@router.get("/paginated", response_model=PaginatedSettlementsResponse)
async def list_settlements_paginated(
    propertyId: Optional[str] = None,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 15,
    current_user: dict = Depends(get_current_user),
):
    query = {}
    if propertyId:
        query["propertyId"] = propertyId
    if status_filter and status_filter.lower() != "all":
        query["status"] = status_filter.lower()

    total = await get_db().settlements.count_documents(query)
    docs = await get_db().settlements.find(query).sort("createdAt", -1).skip(skip).to_list(limit)
    items = [_format_settlement_response(s) for s in docs]
    return PaginatedSettlementsResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
        hasMore=(skip + len(items)) < total,
    )

@router.get("", response_model=List[SettlementResponse])
async def list_settlements(
    propertyId: Optional[str] = None,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 500,
    current_user: dict = Depends(get_current_user),
):
    query = {}
    if propertyId:
        query["propertyId"] = propertyId
    if status_filter and status_filter.lower() != "all":
        query["status"] = status_filter.lower()

    docs = await get_db().settlements.find(query).sort("createdAt", -1).skip(skip).to_list(limit if limit > 0 else 500)
    return [_format_settlement_response(s) for s in docs]

@router.post("", response_model=SettlementResponse, status_code=status.HTTP_201_CREATED)
async def create_settlement(
    payload: SettlementCreate,
    current_user: dict = Depends(get_current_user),
):
    now = datetime.utcnow().isoformat() + "Z"
    actor_id = str(current_user.get("id") or current_user.get("_id") or "")
    actor_name = current_user.get("name") or "Manager"
    amount = round(float(payload.amount), 2)

    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Settlement amount must be greater than zero.",
        )

    # 2-step verification logic:
    # If the receiver themselves (paidTo) logs the payment, it's already verified and confirmed.
    # Otherwise, it's created as 'pending' awaiting receiver confirmation.
    is_receiver = actor_id == str(payload.paidTo)
    initial_status = "confirmed" if is_receiver else "pending"
    settled_at = now if is_receiver else None
    confirmed_by = actor_id if is_receiver else None

    action_note = (
        f"Direct receipt confirmed by recipient ({actor_name})"
        if is_receiver
        else f"Settlement recorded by {actor_name}; awaiting receipt confirmation from {payload.paidToName}"
    )

    initial_audit = [
        {
            "action": "confirmed" if is_receiver else "created",
            "actorId": actor_id,
            "actorName": actor_name,
            "timestamp": now,
            "notes": (payload.notes or "").strip() or action_note,
        }
    ]

    record = {
        "_id": f"settle_{int(time.time()*1000)}",
        "propertyId": str(payload.propertyId),
        "settledBy": str(payload.settledBy),
        "settledByName": payload.settledByName or "Partner",
        "paidTo": str(payload.paidTo),
        "paidToName": payload.paidToName or "Partner",
        "amount": amount,
        "paymentMode": payload.paymentMode or "Cash",
        "notes": (payload.notes or "").strip(),
        "status": initial_status,
        "initiatedBy": actor_id,
        "createdAt": now,
        "settledAt": settled_at,
        "confirmedBy": confirmed_by,
        "rejectionReason": None,
        "auditLog": initial_audit,
    }

    await get_db().settlements.insert_one(record)

    # Notify property managers / receiver
    if is_receiver:
        notif_title = "Settlement Confirmed"
        notif_body = f"{actor_name} confirmed receiving ₹{amount:,.2f} ({payload.paymentMode}) from {payload.settledByName}"
        notif_type = "settlement_confirmed"
    else:
        notif_title = "Payment Receipt Confirmation"
        notif_body = f"{actor_name} marked ₹{amount:,.2f} ({payload.paymentMode}) as paid to {payload.paidToName}. Tap to confirm receipt."
        notif_type = "settlement_pending"

    await record_notification(
        property_id=record["propertyId"],
        title=notif_title,
        body=notif_body,
        actor_id=actor_id,
        actor_name=actor_name,
        notif_type=notif_type,
        data={
            "settlementId": record["_id"],
            "amount": amount,
            "paidTo": record["paidTo"],
            "settledBy": record["settledBy"],
            "status": initial_status,
        },
    )

    return _format_settlement_response(record)

@router.patch("/{settlement_id}", response_model=SettlementResponse)
async def update_settlement(
    settlement_id: str,
    payload: SettlementUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    actor_id = str(current_user.get("id") or current_user.get("_id") or "")
    actor_name = current_user.get("name") or "Manager"
    now = datetime.utcnow().isoformat() + "Z"

    doc = await get_db().settlements.find_one({"_id": settlement_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Settlement '{settlement_id}' not found.",
        )

    current_status = (doc.get("status") or "pending").lower()
    if current_status == "confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit an accepted & settled request. Confirmed settlements are strictly read-only and immutable.",
        )

    if current_status in ["cancelled", "rejected", "declined"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot edit a {current_status} settlement request.",
        )

    # Permission check: Only requester (settledBy or initiatedBy) or admin
    settled_by = str(doc.get("settledBy", ""))
    initiated_by = str(doc.get("initiatedBy", ""))
    user_role = current_user.get("role")
    if actor_id not in [settled_by, initiated_by] and user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the requester can edit this pending settlement request.",
        )

    updates = {}
    changes = []
    if payload.amount is not None:
        new_amt = round(float(payload.amount), 2)
        if new_amt <= 0:
            raise HTTPException(status_code=400, detail="Settlement amount must be positive.")
        old_amt = float(doc.get("amount", 0))
        if new_amt != old_amt:
            updates["amount"] = new_amt
            changes.append(f"amount: ₹{old_amt:,.2f} → ₹{new_amt:,.2f}")

    if payload.paymentMode is not None:
        new_mode = payload.paymentMode.strip()
        old_mode = doc.get("paymentMode", "")
        if new_mode and new_mode != old_mode:
            updates["paymentMode"] = new_mode
            changes.append(f"mode: {old_mode} → {new_mode}")

    if payload.notes is not None:
        new_notes = payload.notes.strip()
        if new_notes != doc.get("notes", ""):
            updates["notes"] = new_notes
            changes.append("notes updated")

    if not updates:
        return _format_settlement_response(doc)

    change_desc = ", ".join(changes) if changes else "Details updated"
    audit_entry = {
        "action": "edited",
        "actorId": actor_id,
        "actorName": actor_name,
        "timestamp": now,
        "notes": f"Edited request ({change_desc})",
    }

    updates["updatedAt"] = now

    await get_db().settlements.update_one(
        {"_id": settlement_id},
        {
            "$set": updates,
            "$push": {"auditLog": audit_entry},
        },
    )

    updated = await get_db().settlements.find_one({"_id": settlement_id})

    # Notify recipient
    effective_amt = float(updated.get("amount", 0))
    await record_notification(
        property_id=doc.get("propertyId"),
        title="Settlement Request Updated",
        body=f"{actor_name} updated pending settlement request to ₹{effective_amt:,.2f} ({updated.get('paymentMode')})",
        actor_id=actor_id,
        actor_name=actor_name,
        notif_type="settlement_updated",
        data={
            "settlementId": settlement_id,
            "amount": effective_amt,
            "status": "pending",
        },
    )

    return _format_settlement_response(updated)

@router.patch("/{settlement_id}/confirm", response_model=SettlementResponse)
async def confirm_settlement(
    settlement_id: str,
    current_user: dict = Depends(get_current_user),
):
    actor_id = str(current_user.get("id") or current_user.get("_id") or "")
    actor_name = current_user.get("name") or "Manager"
    now = datetime.utcnow().isoformat() + "Z"

    doc = await get_db().settlements.find_one({"_id": settlement_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Settlement '{settlement_id}' not found.",
        )

    # Idempotent return if already confirmed
    if doc.get("status") == "confirmed":
        return _format_settlement_response(doc)

    if doc.get("status") == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot confirm a cancelled settlement request.",
        )

    if doc.get("status") == "rejected":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot confirm a rejected settlement. Please create a new settlement record.",
        )

    # Check permission: Only the receiver (paidTo) or system admin can confirm
    paid_to_id = str(doc.get("paidTo", ""))
    is_admin = current_user.get("role") == "admin"
    if actor_id and paid_to_id and actor_id != paid_to_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the payment recipient or an admin can confirm receipt.",
        )

    audit_entry = {
        "action": "confirmed",
        "actorId": actor_id,
        "actorName": actor_name,
        "timestamp": now,
        "notes": "Payment receipt confirmed by recipient",
    }

    await get_db().settlements.update_one(
        {"_id": settlement_id},
        {
            "$set": {
                "status": "confirmed",
                "settledAt": now,
                "confirmedBy": actor_id,
            },
            "$push": {"auditLog": audit_entry},
        },
    )

    updated = await get_db().settlements.find_one({"_id": settlement_id})

    # Notify co-managers / payer
    amount = float(doc.get("amount", 0))
    await record_notification(
        property_id=doc.get("propertyId"),
        title="Settlement Confirmed",
        body=f"{actor_name} confirmed receipt of ₹{amount:,.2f} from {doc.get('settledByName')}",
        actor_id=actor_id,
        actor_name=actor_name,
        notif_type="settlement_confirmed",
        data={
            "settlementId": settlement_id,
            "amount": amount,
            "settledBy": doc.get("settledBy"),
            "status": "confirmed",
        },
    )

    return _format_settlement_response(updated)

@router.patch("/{settlement_id}/reject", response_model=SettlementResponse)
async def reject_settlement(
    settlement_id: str,
    payload: Optional[SettlementRejectRequest] = None,
    current_user: dict = Depends(get_current_user),
):
    actor_id = str(current_user.get("id") or current_user.get("_id") or "")
    actor_name = current_user.get("name") or "Manager"
    now = datetime.utcnow().isoformat() + "Z"
    reason = (payload.reason if payload and payload.reason else "Payment not received").strip()

    doc = await get_db().settlements.find_one({"_id": settlement_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Settlement '{settlement_id}' not found.",
        )

    if doc.get("status") == "confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot decline an already accepted and confirmed settlement. Confirmed settlements are strictly read-only.",
        )

    if doc.get("status") == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot decline a cancelled settlement request.",
        )

    # Permission check: Only the receiver (paidTo) or system admin can decline
    paid_to_id = str(doc.get("paidTo", ""))
    is_admin = current_user.get("role") == "admin"
    if actor_id and paid_to_id and actor_id != paid_to_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the payment recipient or an admin can decline this settlement.",
        )

    audit_entry = {
        "action": "rejected",
        "actorId": actor_id,
        "actorName": actor_name,
        "timestamp": now,
        "notes": f"Declined: {reason}",
    }

    await get_db().settlements.update_one(
        {"_id": settlement_id},
        {
            "$set": {
                "status": "rejected",
                "rejectionReason": reason,
            },
            "$push": {"auditLog": audit_entry},
        },
    )

    updated = await get_db().settlements.find_one({"_id": settlement_id})

    # Notify payer
    amount = float(doc.get("amount", 0))
    await record_notification(
        property_id=doc.get("propertyId"),
        title="Settlement Declined",
        body=f"{actor_name} declined the settlement of ₹{amount:,.2f}. Reason: {reason}",
        actor_id=actor_id,
        actor_name=actor_name,
        notif_type="settlement_rejected",
        data={
            "settlementId": settlement_id,
            "amount": amount,
            "settledBy": doc.get("settledBy"),
            "status": "rejected",
            "reason": reason,
        },
    )

    return _format_settlement_response(updated)

@router.patch("/{settlement_id}/cancel", response_model=SettlementResponse)
@router.delete("/{settlement_id}", response_model=SettlementResponse)
async def cancel_settlement(
    settlement_id: str,
    current_user: dict = Depends(get_current_user),
):
    actor_id = str(current_user.get("id") or current_user.get("_id") or "")
    actor_name = current_user.get("name") or "Manager"
    now = datetime.utcnow().isoformat() + "Z"

    doc = await get_db().settlements.find_one({"_id": settlement_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Settlement '{settlement_id}' not found.",
        )

    # Strictly read-only once confirmed
    if doc.get("status") == "confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel an accepted & settled request. Confirmed settlements are strictly read-only and immutable.",
        )

    if doc.get("status") == "cancelled":
        return _format_settlement_response(doc)

    if doc.get("status") == "rejected":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel an already declined settlement.",
        )

    settled_by = str(doc.get("settledBy", ""))
    initiated_by = str(doc.get("initiatedBy", ""))
    paid_to = str(doc.get("paidTo", ""))
    user_role = current_user.get("role")

    is_creator = actor_id in [settled_by, initiated_by, paid_to]
    is_admin = user_role == "admin"
    if not (is_creator or is_admin):
        prop = await get_db().properties.find_one({"_id": doc.get("propertyId")})
        managers = [str(m) for m in (prop.get("managers") or [])] if prop else []
        if actor_id not in managers:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to cancel this settlement request.",
            )

    audit_entry = {
        "action": "cancelled",
        "actorId": actor_id,
        "actorName": actor_name,
        "timestamp": now,
        "notes": "Settlement request cancelled by payer",
    }

    await get_db().settlements.update_one(
        {"_id": settlement_id},
        {
            "$set": {
                "status": "cancelled",
                "cancelledAt": now,
                "cancelledBy": actor_id,
            },
            "$push": {"auditLog": audit_entry},
        },
    )

    updated = await get_db().settlements.find_one({"_id": settlement_id})

    amount = float(doc.get("amount", 0))
    await record_notification(
        property_id=doc.get("propertyId"),
        title="Settlement Request Cancelled",
        body=f"{actor_name} cancelled the pending settlement request of ₹{amount:,.2f}",
        actor_id=actor_id,
        actor_name=actor_name,
        notif_type="settlement_cancelled",
        data={
            "settlementId": settlement_id,
            "amount": amount,
            "status": "cancelled",
        },
    )

    return _format_settlement_response(updated)

