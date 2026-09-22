import { TABLE_STYLE, formatInr, makeTh, makeTd, sectionTitle } from './excelStyles';

/**
 * buildPersonTables — generates one table per manager showing every expense
 * they were involved in (either as payer or as a split participant), plus
 * a footer row summarising their total paid, fair share, and net balance.
 *
 * @param {Array}  managers  - array of manager objects {id, name, email}
 * @param {Array}  expenses  - full expense list
 * @returns {string}  HTML string for all per-person tables
 */
export const buildPersonTables = (managers = [], expenses = []) => {
  if (!managers.length || !expenses.length) return '';

  const totalManagers = managers.length;

  const tables = managers.map((manager, managerIdx) => {
    const accentColors = ['#0369A1', '#7C3AED', '#BE185D', '#0F766E', '#B45309', '#16A34A'];
    const accent = accentColors[managerIdx % accentColors.length];

    // Expenses where this manager paid OR is in the split list
    const relevant = expenses.filter(
      (e) => e.paidBy === manager.id || (e.splitAmong || []).includes(manager.id)
    );

    const headers = [
      makeTh('Date', accent, '100px'),
      makeTh('Title', accent, '200px'),
      makeTh('Category', accent, '140px'),
      makeTh('Total Amount', accent, '130px'),
      makeTh('Paid By', accent, '140px'),
      makeTh('My Role', accent, '120px'),
      makeTh('My Share', accent, '120px'),
      makeTh('Amount I Paid', accent, '130px'),
    ].join('');

    let totalPaid = 0;
    let totalShare = 0;

    const rows = relevant.map((exp, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#F8FAFC';
      const d = new Date(exp.date || exp.createdAt);
      const dateStr = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : 'N/A';

      const splits = exp.splitAmong || [];
      const splitCount = splits.length || 1;
      const expAmount = Number(exp.amount || 0);
      const myShare = splits.includes(manager.id)
        ? (Number(exp.sharePerPerson) || Math.round((expAmount / splitCount) * 100) / 100)
        : 0;
      const iPaid = exp.paidBy === manager.id ? expAmount : 0;

      totalPaid += iPaid;
      totalShare += myShare;

      const isPayer = exp.paidBy === manager.id;
      const isSplitMember = splits.includes(manager.id);
      let role = '';
      if (isPayer && isSplitMember) role = 'Paid + Split';
      else if (isPayer) role = 'Payer Only';
      else role = 'Split Share';

      const paidByName = managers.find((m) => m.id === exp.paidBy)?.name || exp.paidBy || 'Unknown';

      return `<tr>
        ${makeTd(dateStr, false, bg)}
        ${makeTd(exp.title || 'Untitled', false, bg, true)}
        ${makeTd(exp.category || 'General', false, bg)}
        ${makeTd(formatInr(expAmount), true, bg)}
        ${makeTd(paidByName, false, bg, isPayer)}
        ${makeTd(role, false, bg)}
        ${makeTd(myShare > 0 ? formatInr(myShare) : '—', true, bg)}
        ${makeTd(iPaid > 0 ? formatInr(iPaid) : '—', true, bg, isPaid)}
      </tr>`;
    }).join('');

    const net = Math.round((totalPaid - totalShare) * 100) / 100;
    const netLabel = net > 0
      ? `Gets Back ${formatInr(net)}`
      : net < 0
      ? `Owes ${formatInr(Math.abs(net))}`
      : 'Fully Settled ✓';
    const netColor = net > 0 ? '#16A34A' : net < 0 ? '#DC2626' : '#16A34A';

    const summaryRow = `<tr>
      <td colspan="6" style="background-color: ${accent}15; font-weight: bold; color: #1E293B; padding: 10px 12px; border: 1px solid #CBD5E1; text-align: right;">
        ${manager.name} Summary:
      </td>
      <td style="background-color: ${accent}15; font-weight: bold; text-align: right; padding: 10px 12px; border: 1px solid #CBD5E1; color: #1E293B;">
        ${formatInr(totalShare)}
      </td>
      <td style="background-color: ${accent}15; font-weight: bold; text-align: right; padding: 10px 12px; border: 1px solid #CBD5E1; color: #1E293B;">
        ${formatInr(totalPaid)}
      </td>
    </tr>
    <tr>
      <td colspan="8" style="background-color: ${netColor}20; font-weight: bold; color: ${netColor}; padding: 10px 12px; border: 1px solid #CBD5E1; text-align: center; font-size: 12pt;">
        Net Position: ${netLabel}
      </td>
    </tr>`;

    const noDataRow = `<tr>
      <td colspan="8" style="text-align: center; padding: 16px; background: #F8FAFC; color: #64748B; font-style: italic;">
        No expenses found for ${manager.name}
      </td>
    </tr>`;

    return `
      <table ${TABLE_STYLE}>
        ${sectionTitle(`${managerIdx + 5}. ${manager.name}'s Expense Breakdown`, accent, 8)}
        <tr>${headers}</tr>
        ${relevant.length > 0 ? rows + summaryRow : noDataRow}
      </table>
    `;
  });

  return tables.join('');
};
