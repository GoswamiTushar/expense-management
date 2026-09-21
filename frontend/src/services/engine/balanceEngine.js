export const computeBalances = (expenses = [], settlements = [], managers = [], currentUserId = '') => {
  const checkpoints = {};
  settlements.forEach((s) => {
    if (!s.settledBy || !s.paidTo) return;
    const key = [s.settledBy, s.paidTo].sort().join('__');
    const t = new Date(s.settledAt || s.createdAt).getTime();
    if (!checkpoints[key] || t > checkpoints[key]) checkpoints[key] = t;
  });

  const debts = {};
  managers.forEach((m1) => {
    debts[m1] = {};
    managers.forEach((m2) => { if (m1 !== m2) debts[m1][m2] = 0; });
  });

  expenses.forEach((exp) => {
    const payer = exp.paidBy;
    const splitAmong = exp.splitAmong || managers;
    const expTime = new Date(exp.createdAt || exp.date).getTime();
    const share = Number(exp.sharePerPerson) || 0;
    splitAmong.forEach((member) => {
      if (member === payer || !managers.includes(member) || !managers.includes(payer)) return;
      const key = [member, payer].sort().join('__');
      if (expTime > (checkpoints[key] || 0)) debts[member][payer] = (debts[member][payer] || 0) + share;
    });
  });

  const peopleUserOwes = [];
  const peopleWhoOweUser = [];
  let currentUserNet = 0;

  managers.forEach((other) => {
    if (other === currentUserId) return;
    const userOwesOther = debts[currentUserId]?.[other] || 0;
    const otherOwesUser = debts[other]?.[currentUserId] || 0;
    const net = Math.round((userOwesOther - otherOwesUser) * 100) / 100;
    if (net > 0) {
      peopleUserOwes.push({ userId: other, amount: net });
      currentUserNet -= net;
    } else if (net < 0) {
      const pos = Math.abs(net);
      peopleWhoOweUser.push({ userId: other, amount: pos });
      currentUserNet += pos;
    }
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  return { currentUserNet: Math.round(currentUserNet * 100) / 100, peopleUserOwes, peopleWhoOweUser, totalExpenses };
};
