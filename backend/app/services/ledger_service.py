"""
Mathematical Ledger Service
Provides authoritative double-entry balance calculations for properties.
Calculates pairwise net debts, natural overpayment credits, and tracks pending settlements.
"""

from typing import List, Dict, Any
from app.database import get_db

async def calculate_property_balances(property_id: str, current_user_id: str = "") -> Dict[str, Any]:
    db = get_db()
    current_user_id = str(current_user_id or "")

    # 1. Fetch Property and Managers
    prop = await db.properties.find_one({"_id": property_id})
    if not prop:
        return {
            "propertyId": property_id,
            "currentUserNet": 0.0,
            "peopleUserOwes": [],
            "peopleWhoOweUser": [],
            "pendingIncoming": [],
            "pendingOutgoing": [],
            "totalExpenses": 0.0,
            "pairwiseDebts": [],
        }

    managers = [str(m) for m in (prop.get("managers") or [])]
    if current_user_id and current_user_id not in managers:
        managers.append(current_user_id)

    # Fetch manager profiles for names
    users = await db.users.find({"_id": {"$in": managers}}).to_list(100)
    user_map = {str(u["_id"]): u.get("name") or "Partner" for u in users}

    # Also check managerDetails on property if stored
    for m in (prop.get("managerDetails") or []):
        m_id = str(m.get("id") or m.get("_id") or "")
        if m_id and m_id not in user_map:
            user_map[m_id] = m.get("name") or "Partner"

    # 2. Fetch all active (non-deleted) expenses for property
    raw_expenses = await db.expenses.find({
        "propertyId": property_id,
        "isDeleted": {"$nin": [True, "Y", "y"]},
        "deleted": {"$nin": [True, "Y", "y"]},
    }).to_list(5000)
    expenses = [
        e for e in raw_expenses
        if not e.get("isDeleted")
        and not e.get("deleted")
        and str(e.get("deleted", "")).upper() != "Y"
        and str(e.get("isDeleted", "")).upper() != "Y"
    ]
    total_expenses = sum(float(e.get("amount") or 0) for e in expenses)

    # 3. Initialize Expense Debts matrix: debts[debtor][creditor]
    expense_debts: Dict[str, Dict[str, float]] = {
        m1: {m2: 0.0 for m2 in managers if m2 != m1} for m1 in managers
    }

    for exp in expenses:
        payer = str(exp.get("paidBy", ""))
        splits = [str(s) for s in (exp.get("splitAmong") or managers)]
        share = float(exp.get("sharePerPerson") or 0)
        if share <= 0 and splits:
            share = float(exp.get("amount") or 0) / len(splits)

        for debtor in splits:
            if debtor == payer or debtor not in expense_debts or payer not in expense_debts[debtor]:
                continue
            expense_debts[debtor][payer] += share

    # 4. Fetch all settlements for property
    settlements = await db.settlements.find({"propertyId": property_id}).sort("createdAt", -1).to_list(5000)

    # 5. Initialize Confirmed Settlement Transfers matrix: transfers[payer][receiver]
    settlement_transfers: Dict[str, Dict[str, float]] = {
        m1: {m2: 0.0 for m2 in managers if m2 != m1} for m1 in managers
    }

    pending_incoming: List[Dict[str, Any]] = []
    pending_outgoing: List[Dict[str, Any]] = []

    for s in settlements:
        settled_by = str(s.get("settledBy", ""))
        paid_to = str(s.get("paidTo", ""))
        amt = round(float(s.get("amount", 0)), 2)
        status = (s.get("status") or "pending").lower()

        # Format settlement record helper
        formatted_s = {
            "id": str(s.get("_id")),
            "propertyId": str(s.get("propertyId", "")),
            "settledBy": settled_by,
            "settledByName": s.get("settledByName") or user_map.get(settled_by, "Partner"),
            "paidTo": paid_to,
            "paidToName": s.get("paidToName") or user_map.get(paid_to, "Partner"),
            "amount": amt,
            "paymentMode": s.get("paymentMode") or "Cash",
            "notes": s.get("notes") or "",
            "status": status,
            "initiatedBy": str(s.get("initiatedBy") or ""),
            "createdAt": s.get("createdAt") or s.get("settledAt") or "",
            "settledAt": s.get("settledAt"),
            "confirmedBy": s.get("confirmedBy"),
            "rejectionReason": s.get("rejectionReason"),
            "auditLog": s.get("auditLog") or [],
        }

        # ONLY confirmed settlements reduce/shift balances!
        if status == "confirmed":
            if settled_by in settlement_transfers and paid_to in settlement_transfers[settled_by]:
                settlement_transfers[settled_by][paid_to] += amt
        elif status == "pending":
            if paid_to == current_user_id:
                pending_incoming.append(formatted_s)
            if settled_by == current_user_id:
                pending_outgoing.append(formatted_s)

    # 6. Compute Pairwise Debts for property (u1 < u2 to avoid duplicates)
    pairwise_debts = []
    processed_pairs = set()

    for i in range(len(managers)):
        for j in range(i + 1, len(managers)):
            u1, u2 = managers[i], managers[j]
            pair_key = f"{min(u1, u2)}__{max(u1, u2)}"
            if pair_key in processed_pairs:
                continue
            processed_pairs.add(pair_key)

            # Net expense debt from u1 to u2
            net_exp = (expense_debts.get(u1, {}).get(u2, 0.0)) - (expense_debts.get(u2, {}).get(u1, 0.0))
            # Net settlement transfer from u1 to u2
            net_trans = (settlement_transfers.get(u1, {}).get(u2, 0.0)) - (settlement_transfers.get(u2, {}).get(u1, 0.0))
            # Cumulative Net Debt: positive = u1 owes u2; negative = u2 owes u1
            net = round(net_exp - net_trans, 2)

            if net > 0:
                pairwise_debts.append({
                    "fromUserId": u1,
                    "fromName": user_map.get(u1, "Partner"),
                    "toUserId": u2,
                    "toName": user_map.get(u2, "Partner"),
                    "amount": net,
                })
            elif net < 0:
                pairwise_debts.append({
                    "fromUserId": u2,
                    "fromName": user_map.get(u2, "Partner"),
                    "toUserId": u1,
                    "toName": user_map.get(u1, "Partner"),
                    "amount": round(abs(net), 2),
                })

    # 7. Compute Specific Balances for Current User
    people_user_owes = []
    people_who_owe_user = []
    current_user_net = 0.0

    if current_user_id:
        for other in managers:
            if other == current_user_id:
                continue

            net_exp = (expense_debts.get(current_user_id, {}).get(other, 0.0)) - (expense_debts.get(other, {}).get(current_user_id, 0.0))
            net_trans = (settlement_transfers.get(current_user_id, {}).get(other, 0.0)) - (settlement_transfers.get(other, {}).get(current_user_id, 0.0))
            net = round(net_exp - net_trans, 2)

            if net > 0:
                people_user_owes.append({
                    "userId": other,
                    "name": user_map.get(other, "Partner"),
                    "amount": net,
                })
                current_user_net -= net
            elif net < 0:
                pos = round(abs(net), 2)
                people_who_owe_user.append({
                    "userId": other,
                    "name": user_map.get(other, "Partner"),
                    "amount": pos,
                })
                current_user_net += pos

    return {
        "propertyId": property_id,
        "currentUserNet": round(current_user_net, 2),
        "peopleUserOwes": people_user_owes,
        "peopleWhoOweUser": people_who_owe_user,
        "pendingIncoming": pending_incoming,
        "pendingOutgoing": pending_outgoing,
        "totalExpenses": round(total_expenses, 2),
        "pairwiseDebts": pairwise_debts,
    }
