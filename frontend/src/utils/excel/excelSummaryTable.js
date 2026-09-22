import { TABLE_STYLE, formatInr, makeTh, makeTd, sectionTitle } from './excelStyles';

export const buildOverviewTable = (property, expenses = []) => {
  const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const rows = [
    `<tr>${makeTd('Property Name', false, '#F8FAFC', true)}${makeTd(property?.name || 'Airbnb Property')}${makeTd('Total Spent', false, '#F8FAFC', true)}${makeTd(formatInr(total), true, '#ffffff', true)}</tr>`,
    `<tr>${makeTd('Location', false, '#F8FAFC', true)}${makeTd(property?.location || 'N/A')}${makeTd('Total Expenses', false, '#F8FAFC', true)}${makeTd(expenses.length, true)}</tr>`,
  ];
  return `<table ${TABLE_STYLE}>${sectionTitle('1. Property Overview & Metrics', '#0F766E', 4)}${rows.join('')}</table>`;
};

export const buildSpendingTable = (managers = [], expenses = []) => {
  const headers = [
    makeTh('Manager Name', '#4338CA', '180px'), makeTh('Email', '#4338CA', '220px'),
    makeTh('Total Paid', '#4338CA', '150px'), makeTh('Fair Share', '#4338CA', '150px'),
    makeTh('Net Balance', '#4338CA', '150px'), makeTh('Settlement Status', '#4338CA', '180px'),
  ].join('');

  const rows = managers.map((m, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#F8FAFC';
    const paid = expenses.filter((e) => e.paidBy === m.id).reduce((s, e) => s + Number(e.amount || 0), 0);
    const share = expenses.reduce((s, e) => {
      const splits = e.splitAmong || [];
      if (!splits.includes(m.id)) return s;
      return s + (Number(e.sharePerPerson) || (Number(e.amount || 0) / (splits.length || 1)));
    }, 0);
    const net = Math.round((paid - share) * 100) / 100;
    const status = net > 0 ? `Gets Back ${formatInr(net)}` : net < 0 ? `Owes ${formatInr(Math.abs(net))}` : 'Settled';
    return `<tr>${makeTd(m.name, false, bg, true)}${makeTd(m.email || 'N/A', false, bg)}${makeTd(formatInr(paid), true, bg)}${makeTd(formatInr(share), true, bg)}${makeTd(formatInr(net), true, bg, true)}${makeTd(status, false, bg, true)}</tr>`;
  });

  return `<table ${TABLE_STYLE}>${sectionTitle('2. Manager Spending Breakdown (Who Spent How Much)', '#4338CA', 6)}<tr>${headers}</tr>${rows.join('')}</table>`;
};
