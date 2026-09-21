/**
 * Builds standard RFC 4180 CSV string from expense records.
 */
export const buildExpenseCsv = (expenses = [], users = [], propertyName = '') => {
  const getUserName = (id) => users.find((u) => u._id === id)?.name || id;

  const headers = [
    'Date',
    'Time',
    'Property',
    'Title',
    'Category',
    'Amount (INR)',
    'Paid By',
    'Split Among Count',
    'Share Per Person (INR)',
    'Receipt URL',
    'Notes',
  ];

  const rows = expenses.map((exp) => {
    const d = new Date(exp.date || exp.createdAt);
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = d.toTimeString().split(' ')[0];
    const payerName = getUserName(exp.paidBy);
    const splitCount = exp.splitAmong?.length || 1;
    const share = exp.sharePerPerson || Math.round((exp.amount / splitCount) * 100) / 100;
    const notes = (exp.notes || '').replace(/"/g, '""');
    const title = (exp.title || '').replace(/"/g, '""');

    return [
      `"${dateStr}"`,
      `"${timeStr}"`,
      `"${propertyName || exp.propertyId}"`,
      `"${title}"`,
      `"${exp.category}"`,
      exp.amount,
      `"${payerName}"`,
      splitCount,
      share,
      `"${exp.receiptUrl || 'None'}"`,
      `"${notes}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};
