import { TABLE_STYLE, formatInr, makeTh, makeTd, sectionTitle } from './excelStyles';
import { categories, getCategoryById } from '../../theme/categories';

/**
 * buildCategoryTable — generates a category-wise overview breakdown table
 * showing count, total spend, % share of total, and average spend per category.
 *
 * @param {Array} expenses - list of expense objects
 * @returns {string} HTML table string
 */
export const buildCategoryTable = (expenses = []) => {
  if (!expenses || expenses.length === 0) {
    return `<table ${TABLE_STYLE}>${sectionTitle('3. Category-Wise Spending Summary', '#0D9488', 5)}<tr>${makeTd('No expenses logged yet.', false, '#ffffff', false)}</tr></table>`;
  }

  const grandTotal = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalCount = expenses.length;

  // Group by canonical category
  const categoryStats = {};

  expenses.forEach((e) => {
    const rawCat = e.category || 'Other';
    const catObj = getCategoryById(rawCat);
    const catKey = catObj?.id || rawCat;
    const label = catObj?.label || rawCat;

    if (!categoryStats[catKey]) {
      categoryStats[catKey] = {
        id: catKey,
        label,
        count: 0,
        total: 0,
      };
    }
    categoryStats[catKey].count += 1;
    categoryStats[catKey].total += Number(e.amount || 0);
  });

  // Sort by highest spending first
  const sortedCategories = Object.values(categoryStats).sort((a, b) => b.total - a.total);

  const headers = [
    makeTh('Category', '#0D9488', '220px'),
    makeTh('Expense Count', '#0D9488', '140px'),
    makeTh('Total Spent', '#0D9488', '160px'),
    makeTh('% of Total Spend', '#0D9488', '160px'),
    makeTh('Average Expense', '#0D9488', '160px'),
  ].join('');

  const rows = sortedCategories.map((item, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#F8FAFC';
    const pct = grandTotal > 0 ? ((item.total / grandTotal) * 100).toFixed(1) + '%' : '0.0%';
    const avg = item.count > 0 ? item.total / item.count : 0;

    return `<tr>${makeTd(item.label, false, bg, true)}${makeTd(item.count, true, bg)}${makeTd(formatInr(item.total), true, bg, true)}${makeTd(pct, true, bg)}${makeTd(formatInr(avg), true, bg)}</tr>`;
  });

  // Total footer row
  const overallAvg = totalCount > 0 ? grandTotal / totalCount : 0;
  const footerRow = `<tr>${makeTd('Total', false, '#F0FDFA', true)}${makeTd(totalCount, true, '#F0FDFA', true)}${makeTd(formatInr(grandTotal), true, '#F0FDFA', true)}${makeTd('100.0%', true, '#F0FDFA', true)}${makeTd(formatInr(overallAvg), true, '#F0FDFA', true)}</tr>`;

  return `<table ${TABLE_STYLE}>${sectionTitle('3. Category-Wise Spending Summary', '#0D9488', 5)}<tr>${headers}</tr>${rows.join('')}${footerRow}</table>`;
};

/**
 * buildCategoryDetailTables — generates a dedicated table for each category
 * containing its itemized expenses, subtotal, and manager attribution.
 *
 * @param {Array} expenses - list of expense objects
 * @param {Object} userMap - map of user IDs to user objects
 * @returns {string} HTML string containing individual tables for all categories
 */
export const buildCategoryDetailTables = (expenses = [], userMap = {}) => {
  const getName = (id) => userMap[id]?.name || id;

  // Gather all predefined categories in standard order, plus any non-standard ones from expenses
  const allCategoryList = [...categories];
  const knownIds = new Set(categories.map((c) => c.id.toLowerCase()));

  expenses.forEach((e) => {
    if (e.category) {
      const catObj = getCategoryById(e.category);
      if (catObj && !knownIds.has(catObj.id.toLowerCase())) {
        allCategoryList.push(catObj);
        knownIds.add(catObj.id.toLowerCase());
      }
    }
  });

  const tables = allCategoryList.map((cat, idx) => {
    // Filter expenses matching this category
    const catExpenses = expenses.filter((e) => {
      const matched = getCategoryById(e.category || 'Other');
      return matched.id === cat.id;
    });

    const catTotal = catExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const catCount = catExpenses.length;

    const headers = [
      makeTh('Date', cat.color, '110px'),
      makeTh('Expense Title', cat.color, '220px'),
      makeTh('Amount', cat.color, '140px'),
      makeTh('Paid By', cat.color, '180px'),
      makeTh('Split Among', cat.color, '220px'),
      makeTh('Share / Person', cat.color, '140px'),
      makeTh('Notes', cat.color, '200px'),
    ].join('');

    let rowsHtml = '';

    if (catCount === 0) {
      rowsHtml = `<tr><td colspan="7" style="text-align: center; padding: 14px; background: #F8FAFC; color: #64748B; font-style: italic;">No expenses logged under ${cat.label} yet (INR 0.00 spent).</td></tr>`;
    } else {
      const rows = catExpenses.map((exp, i) => {
        const bg = i % 2 === 0 ? '#ffffff' : '#F8FAFC';
        const d = new Date(exp.date || exp.createdAt);
        const dateStr = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : 'N/A';
        const splitNames = (exp.splitAmong || []).map(getName).join(', ') || 'All';
        const share = exp.sharePerPerson || Math.round((Number(exp.amount || 0) / ((exp.splitAmong || []).length || 1)) * 100) / 100;
        const payer = getName(exp.paidBy);

        return `<tr>
          ${makeTd(dateStr, false, bg)}
          ${makeTd(exp.title || 'Untitled', false, bg, true)}
          ${makeTd(formatInr(exp.amount), true, bg, true)}
          ${makeTd(payer, false, bg, true)}
          ${makeTd(splitNames, false, bg)}
          ${makeTd(formatInr(share), true, bg)}
          ${makeTd(exp.notes || '-', false, bg)}
        </tr>`;
      }).join('');

      const subtotalRow = `<tr>
        <td colspan="2" style="background-color: ${cat.color}15; font-weight: bold; color: #1E293B; padding: 10px 12px; border: 1px solid #CBD5E1; text-align: right;">
          Total Spent on ${cat.label}:
        </td>
        <td style="background-color: ${cat.color}15; font-weight: bold; text-align: right; padding: 10px 12px; border: 1px solid #CBD5E1; color: #1E293B;">
          ${formatInr(catTotal)}
        </td>
        <td colspan="4" style="background-color: ${cat.color}15; font-weight: bold; padding: 10px 12px; border: 1px solid #CBD5E1; color: #475569;">
          ${catCount} expense(s) logged
        </td>
      </tr>`;

      rowsHtml = rows + subtotalRow;
    }

    return `
      <table ${TABLE_STYLE}>
        ${sectionTitle(`6.${idx + 1}. ${cat.label} - Category Expenses`, cat.color, 7)}
        <tr>${headers}</tr>
        ${rowsHtml}
      </table>
    `;
  });

  return tables.join('');
};
