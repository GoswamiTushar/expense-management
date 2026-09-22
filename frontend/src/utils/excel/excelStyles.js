export const TABLE_STYLE = 'border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt; margin-bottom: 24px; width: 100%;"';

export const formatInr = (num) => {
  const val = Number(num) || 0;
  return 'INR ' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const makeTh = (text, bg, width = 'auto') => {
  return `<th style="background-color: ${bg}; color: #ffffff; font-weight: bold; font-size: 11pt; text-align: left; padding: 10px 12px; width: ${width}; border: 1px solid #CBD5E1;">${text}</th>`;
};

export const makeTd = (text, isNum = false, bg = '#ffffff', bold = false) => {
  const align = isNum ? 'right' : 'left';
  const weight = bold ? 'font-weight: bold;' : '';
  return `<td style="background-color: ${bg}; color: #1E293B; text-align: ${align}; padding: 8px 12px; border: 1px solid #CBD5E1; ${weight}">${text}</td>`;
};

export const sectionTitle = (title, bg = '#1E293B', colSpan = 8) => {
  return `<tr><th colspan="${colSpan}" style="background-color: ${bg}; color: #ffffff; font-size: 13pt; font-weight: bold; text-align: left; padding: 12px;">${title}</th></tr>`;
};
