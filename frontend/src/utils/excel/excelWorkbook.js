import { buildOverviewTable, buildSpendingTable } from './excelSummaryTable';
import { buildCategoryTable } from './excelCategoryTable';
import { buildSettlementTable, buildExpensesTable } from './excelSettlementTable';
import { calculatePropertyDebts } from './excelDebts';
import { buildPersonTables } from './excelPersonTable';

export const buildExcelHtml = ({ property, expenses = [], settlements = [], userMap = {} }) => {
  const managers = property?.managerDetails || property?.managers?.map((id) => userMap[id] || { id, name: id }) || [];
  const debts = calculatePropertyDebts(managers, expenses, settlements, userMap);
  const overviewHtml = buildOverviewTable(property, expenses);
  const spendingHtml = buildSpendingTable(managers, expenses);
  const categoryHtml = buildCategoryTable(expenses);
  const settlementHtml = buildSettlementTable(managers, debts);
  const expensesHtml = buildExpensesTable(expenses, userMap);
  const personTablesHtml = buildPersonTables(managers, expenses);

  const banner = `
    <div style="background-color: #0F172A; color: #FFFFFF; padding: 18px 24px; font-family: Calibri, Arial, sans-serif; border-radius: 6px; margin-bottom: 20px;">
      <h1 style="margin: 0 0 6px 0; font-size: 20pt; font-weight: bold; color: #FFFFFF;">AIRBNB EXPENSE &amp; SETTLEMENT REPORT</h1>
      <p style="margin: 0; font-size: 12pt; color: #94A3B8;">${property?.name || 'Property'} • Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
    </div>
  `;

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Expenses &amp; Settlements</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      </head>
      <body style="font-family: Calibri, Arial, sans-serif; padding: 20px; background-color: #FFFFFF;">
        ${banner}
        ${overviewHtml}
        ${spendingHtml}
        ${categoryHtml}
        ${settlementHtml}
        ${expensesHtml}
        ${personTablesHtml}
      </body>
    </html>
  `.trim();
};
