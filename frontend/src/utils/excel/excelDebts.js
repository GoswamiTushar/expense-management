export const calculatePropertyDebts = (managers = [], expenses = [], settlements = [], userMap = {}) => {
  const checkpoints = {};
  settlements.forEach((s) => {
    if (!s.settledBy || !s.paidTo) return;
    const k = [s.settledBy, s.paidTo].sort().join('__');
    const t = new Date(s.settledAt || s.createdAt).getTime();
    if (!checkpoints[k] || t > checkpoints[k]) checkpoints[k] = t;
  });

  const matrix = {};
  const mIds = managers.map((m) => m.id || m._id || m);
  mIds.forEach((id1) => {
    matrix[id1] = {};
    mIds.forEach((id2) => { matrix[id1][id2] = 0; });
  });

  expenses.forEach((exp) => {
    const payer = exp.paidBy;
    const splits = exp.splitAmong || mIds;
    const t = new Date(exp.createdAt || exp.date).getTime();
    const share = Number(exp.sharePerPerson) || (Number(exp.amount || 0) / (splits.length || 1));
    splits.forEach((mbr) => {
      if (mbr === payer || !matrix[mbr] || !matrix[payer]) return;
      const k = [mbr, payer].sort().join('__');
      if (t > (checkpoints[k] || 0)) matrix[mbr][payer] = (matrix[mbr][payer] || 0) + share;
    });
  });

  const debts = [];
  const processed = new Set();
  mIds.forEach((u1) => {
    mIds.forEach((u2) => {
      if (u1 >= u2) return;
      const key = `${u1}_${u2}`;
      if (processed.has(key)) return;
      processed.add(key);
      const net = (matrix[u1]?.[u2] || 0) - (matrix[u2]?.[u1] || 0);
      if (Math.round(net) > 0) {
        debts.push({ from: userMap[u1]?.name || u1, to: userMap[u2]?.name || u2, amount: Math.round(net * 100) / 100 });
      } else if (Math.round(net) < 0) {
        debts.push({ from: userMap[u2]?.name || u2, to: userMap[u1]?.name || u1, amount: Math.round(Math.abs(net) * 100) / 100 });
      }
    });
  });

  return debts;
};
