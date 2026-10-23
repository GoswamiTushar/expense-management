const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

/**
 * Parses any ISO or date string, accurately handling UTC timestamps without a timezone suffix (e.g. from Python utcnow()).
 */
export const parseIsoDate = (isoString) => {
  if (!isoString) return null;
  if (isoString instanceof Date) {
    return isNaN(isoString.getTime()) ? null : isoString;
  }
  let s = String(isoString).trim();
  if (!s) return null;

  // If already contains timezone (ends with Z or +/-offset)
  if (s.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  // Pure date YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // ISO datetime without timezone (e.g. 2026-10-22T18:37:39.936148 or 2026-10-22 18:37:39)
  // Backend stores UTC datetime strings, so append Z to parse accurately in local user time
  s = s.replace(' ', 'T');
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
    s += 'Z';
  }

  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

export const formatDate = (isoString) => {
  if (!isoString) return '';
  if (typeof isoString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoString.trim())) {
    const [y, m, d] = isoString.trim().split('-').map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
  }
  const d = parseIsoDate(isoString);
  if (!d) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatTime = (isoString) => {
  if (!isoString) return '';
  if (typeof isoString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoString.trim())) {
    return '';
  }
  const d = parseIsoDate(isoString);
  if (!d) return '';
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

export const formatDateTime = (isoString) => {
  if (!isoString) return '';
  if (typeof isoString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoString.trim())) {
    return formatDate(isoString);
  }
  const d = parseIsoDate(isoString);
  if (!d) return '';
  const dateStr = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${dateStr}, ${hours}:${minutes} ${ampm}`;
};
