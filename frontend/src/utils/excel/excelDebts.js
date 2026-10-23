/**
 * Calculates pairwise debts for Excel report using the double-entry ledger formula.
 * Only confirmed settlements reduce balances. Overpayments flip debt direction.
 */
export const calculatePropertyDebts = (managers = [], expenses = [], settlements = [], userMap = {}) => {
  const mIds = Array.from(new Set(managers.map((m) => String(m.id || m._id || m))));

  // 1. Matrix of raw expense debts
  const matrix = {};
  mIds.forEach((id1) => {
    matrix[id1] = {};
    mIds.forEach((id2) => {
      if (id1 !== id2) matrix[id1][id2] = 0;
    });
  });

  expenses.forEach((exp) => {
    const payer = String(exp.paidBy || '');
    const splits = (exp.splitAmong || mIds).map((s) => String(s.id || s._id || s));
    const share = Number(exp.sharePerPerson) || (splits.length ? Number(exp.amount || 0) / splits.length : 0);

    splits.forEach((mbr) => {
      if (mbr === payer || !matrix[mbr] || matrix[mbr][payer] === undefined) return;
      matrix[mbr][payer] += share;
    });
  });

  // 2. Confirmed transfers
  const transfers = {};
  mIds.forEach((id1) => {
    transfers[id1] = {};
    mIds.forEach((id2) => {
      if (id1 !== id2) transfers[id1][id2] = 0;
    });
  });

  settlements.forEach((s) => {
    const settledBy = String(s.settledBy || '');
    const paidTo = String(s.paidTo || '');
    const amt = Math.round(Number(s.amount || 0) * 100) / 100;
    const status = String(s.status || 'pending').toLowerCase();

    if (status === 'confirmed') {
      if (transfers[settledBy] && transfers[settledBy][paidTo] !== undefined) {
        transfers[settledBy][paidTo] += amt;
      }
    }
  });

  // 3. Compute net debts
  const debts = [];
  const processed = new Set();

  mIds.forEach((u1) => {
    mIds.forEach((u2) => {
      if (u1 >= u2) return;
      const key = `${u1}_${u2}`;
      if (processed.has(key)) return;
      processed.add(key);

      const netExp = (matrix[u1]?.[u2] || 0) - (matrix[u2]?.[u1] || 0);
      const netTrans = (transfers[u1]?.[u2] || 0) - (transfers[u2]?.[u1] || 0);
      const net = Math.round((netExp - netTrans) * 100) / 100;

      if (net > 0) {
        debts.push({
          from: userMap[u1]?.name || u1,
          to: userMap[u2]?.name || u2,
          amount: net,
        });
      } else if (net < 0) {
        debts.push({
          from: userMap[u2]?.name || u2,
          to: userMap[u1]?.name || u1,
          amount: Math.round(Math.abs(net) * 100) / 100,
        });
      }
    });
  });

  return debts;
};
