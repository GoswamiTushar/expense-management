import { buildExcelHtml } from '../../utils/excel/excelWorkbook';
import { downloadFile } from '../../utils/download/downloadHelper';

/**
 * Generates and downloads the agreed-upon formatted Excel sheet (all 7 tables)
 * with guaranteed proper file name (never UUID).
 */
export const exportExpensesToExcel = async ({ property, expenses = [], settlements = [], userMap = {} }) => {
  const htmlContent = buildExcelHtml({ property, expenses, settlements, userMap });
  const propSlug = (property?.name || 'airbnb').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const fileName = `expenses_${propSlug}_${Date.now()}.xls`;

  const blobUrl = await downloadFile(
    htmlContent,
    fileName,
    'application/vnd.ms-excel;charset=utf-8;'
  );

  return { success: true, fileName, htmlContent, blobUrl };
};
