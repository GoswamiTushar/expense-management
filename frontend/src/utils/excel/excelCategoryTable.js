import { TABLE_STYLE, formatInr, makeTh, makeTd, sectionTitle } from './excelStyles';
import { getCategoryById } from '../../theme/categories';

/**
 * buildCategoryTable — generates a category-wise breakdown table
 * showing count, total spend, % share of total, and average spend per category.
 *
 * @param {Array} expenses - list of expense objects
 * @returns {string} HTML table string
 */
export const buildCategoryTable = (expenses = []) => {
  if (!expenses || expenses.length === 0) {
    return `<table ${TABLE_STYLE}>${sectionTitle('3. Category-Wise Spending Breakdown', '#0D9488', 5)}<tr>${makeTd('No expenses logged yet.', false, '#ffffff', false)}</tr></table>`;
  }

  const grandTotal = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalCount = expenses.length;

  // Group by category
  const categoryStats = {};

  expenses.forEach((e) => {
    const catId = e.category || 'Other';
    const catObj = getCategoryById(catId);
    const label = catObj?.label || catId;

    if (!categoryStats[catId]) {
      categoryStats[catId] = {
        id: catId,
        label,
        count: 0,
        total: 0,
      };
    }
    categoryStats[catId].count += 1;
    categoryStats[catId].total += Number(e.amount || 0);
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

  return `<table ${TABLE_STYLE}>${sectionTitle('3. Category-Wise Spending Breakdown', '#0D9488', 5)}<tr>${headers}</tr>${rows.join('')}${footerRow}</table>`;
};
