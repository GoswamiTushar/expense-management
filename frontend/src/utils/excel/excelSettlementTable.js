import { TABLE_STYLE, formatInr, makeTh, makeTd, sectionTitle } from './excelStyles';

export const buildSettlementTable = (managers = [], debts = []) => {
  const headers = [
    makeTh('Debtor (Who Pays)', '#B45309', '200px'), makeTh('Creditor (Who Receives)', '#B45309', '200px'),
    makeTh('Amount Due', '#B45309', '160px'), makeTh('Status', '#B45309', '180px'),
  ].join('');

  const rows = debts.length === 0
    ? `<tr><td colspan="4" style="text-align: center; padding: 14px; background: #F8FAFC; color: #16A34A; font-weight: bold;">Zero Pending Dues - All balances fully settled!</td></tr>`
    : debts.map((d, i) => {
        const bg = i % 2 === 0 ? '#ffffff' : '#F8FAFC';
        return `<tr>${makeTd(d.from, false, bg, true)}${makeTd(d.to, false, bg, true)}${makeTd(formatInr(d.amount), true, bg, true)}${makeTd('Pending Settlement', false, bg)}</tr>`;
      }).join('');

  return `<table ${TABLE_STYLE}>${sectionTitle('3. Settlement Summary (Who Owes Whom)', '#B45309', 4)}<tr>${headers}</tr>${rows}</table>`;
};

export const buildExpensesTable = (expenses = [], userMap = {}) => {
  const getName = (id) => userMap[id]?.name || id;
  const headers = [
    makeTh('Date', '#E11D48', '110px'), makeTh('Title', '#E11D48', '200px'),
    makeTh('Category', '#E11D48', '150px'), makeTh('Amount', '#E11D48', '140px'),
    makeTh('Paid By', '#E11D48', '180px'), makeTh('Split Among', '#E11D48', '220px'),
    makeTh('Share / Person', '#E11D48', '140px'), makeTh('Notes', '#E11D48', '200px'),
  ].join('');

  const rows = expenses.map((exp, i) => {
    const bg = i % 2 === 0 ? '#ffffff' : '#F8FAFC';
    const d = new Date(exp.date || exp.createdAt);
    const dateStr = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : 'N/A';
    const splitNames = (exp.splitAmong || []).map(getName).join(', ') || 'All';
    const share = exp.sharePerPerson || Math.round((Number(exp.amount || 0) / ((exp.splitAmong || []).length || 1)) * 100) / 100;
    return `<tr>${makeTd(dateStr, false, bg)}${makeTd(exp.title || 'Untitled', false, bg, true)}${makeTd(exp.category || 'General', false, bg)}${makeTd(formatInr(exp.amount), true, bg, true)}${makeTd(getName(exp.paidBy), false, bg, true)}${makeTd(splitNames, false, bg)}${makeTd(formatInr(share), true, bg)}${makeTd(exp.notes || '-', false, bg)}</tr>`;
  }).join('');

  return `<table ${TABLE_STYLE}>${sectionTitle('4. Itemized Expenses Record', '#E11D48', 8)}<tr>${headers}</tr>${rows}</table>`;
};
