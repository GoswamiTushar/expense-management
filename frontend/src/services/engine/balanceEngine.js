/**
 * Double-Entry Balance Calculation Engine
 * Replaces the old timestamp-checkpoint approach with cumulative double-entry calculations.
 *
 * Rules:
 * 1. ONLY settlements with status === 'confirmed' reduce debt.
 * 2. Overpayments naturally flip balances (receiver now owes the payer the surplus,
 *    which automatically offsets future expenses).
 * 3. Person-to-person integrity is strictly maintained (A paying B does not affect C).
 * 4. Pending settlements are collected separately for UI alerts without altering confirmed balances.
 */
export const computeBalances = (expenses = [], settlements = [], managers = [], currentUserId = '') => {
  const mList = Array.from(new Set(managers.map((m) => String(m.id || m._id || m))));
  const uid = String(currentUserId || '');

  // 1. Matrix of raw expense debts: debts[debtor][creditor]
  const debts = {};
  mList.forEach((m1) => {
    debts[m1] = {};
    mList.forEach((m2) => {
      if (m1 !== m2) debts[m1][m2] = 0;
    });
  });

  const activeExpenses = expenses.filter(
    (e) => !e.isDeleted && !e.deleted && e.deleted !== 'Y' && e.isDeleted !== 'Y'
  );

  activeExpenses.forEach((exp) => {
    const payer = String(exp.paidBy || '');
    const rawSplits = exp.splitAmong || mList;
    const splitAmong = rawSplits.map((s) => String(s.id || s._id || s));
    const share = Number(exp.sharePerPerson) || (splitAmong.length ? Number(exp.amount || 0) / splitAmong.length : 0);

    splitAmong.forEach((debtor) => {
      if (debtor === payer || !debts[debtor] || debts[debtor][payer] === undefined) return;
      debts[debtor][payer] += share;
    });
  });

  // 2. Direct settlement transfers: transfers[payer][receiver]
  const transfers = {};
  mList.forEach((m1) => {
    transfers[m1] = {};
    mList.forEach((m2) => {
      if (m1 !== m2) transfers[m1][m2] = 0;
    });
  });

  const pendingIncoming = [];
  const pendingOutgoing = [];

  settlements.forEach((s) => {
    const settledBy = String(s.settledBy || '');
    const paidTo = String(s.paidTo || '');
    const amt = Math.round(Number(s.amount || 0) * 100) / 100;
    const status = String(s.status || 'pending').toLowerCase();

    if (status === 'confirmed') {
      if (transfers[settledBy] && transfers[settledBy][paidTo] !== undefined) {
        transfers[settledBy][paidTo] += amt;
      }
    } else if (status === 'pending') {
      if (paidTo === uid) pendingIncoming.push(s);
      if (settledBy === uid) pendingOutgoing.push(s);
    }
  });

  // 3. Compute Net Pairwise Debts for all manager pairs
  const pairwiseDebts = [];
  for (let i = 0; i < mList.length; i++) {
    for (let j = i + 1; j < mList.length; j++) {
      const u1 = mList[i];
      const u2 = mList[j];

      const netExp = (debts[u1]?.[u2] || 0) - (debts[u2]?.[u1] || 0);
      const netTrans = (transfers[u1]?.[u2] || 0) - (transfers[u2]?.[u1] || 0);
      const net = Math.round((netExp - netTrans) * 100) / 100;

      if (net > 0) {
        pairwiseDebts.push({ fromUserId: u1, toUserId: u2, amount: net });
      } else if (net < 0) {
        pairwiseDebts.push({ fromUserId: u2, toUserId: u1, amount: Math.abs(net) });
      }
    }
  }

  // 4. Compute Specific Balances for Current User
  const peopleUserOwes = [];
  const peopleWhoOweUser = [];
  let currentUserNet = 0;

  if (uid) {
    mList.forEach((other) => {
      if (other === uid) return;

      const netExp = (debts[uid]?.[other] || 0) - (debts[other]?.[uid] || 0);
      const netTrans = (transfers[uid]?.[other] || 0) - (transfers[other]?.[uid] || 0);
      const net = Math.round((netExp - netTrans) * 100) / 100;

      if (net > 0) {
        peopleUserOwes.push({ userId: other, amount: net });
        currentUserNet -= net;
      } else if (net < 0) {
        const pos = Math.abs(net);
        peopleWhoOweUser.push({ userId: other, amount: pos });
        currentUserNet += pos;
      }
    });
  }

  const totalExpenses = activeExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return {
    currentUserNet: Math.round(currentUserNet * 100) / 100,
    peopleUserOwes,
    peopleWhoOweUser,
    pendingIncoming,
    pendingOutgoing,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    pairwiseDebts,
  };
};
