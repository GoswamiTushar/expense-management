const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

export const formatDate = (isoString) => {
  if (!isoString) return '';
  if (typeof isoString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    const [y, m, d] = isoString.split('-').map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
  }
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatTime = (isoString) => {
  if (!isoString) return '';
  if (typeof isoString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    return '';
  }
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

export const formatDateTime = (isoString) => {
  if (!isoString) return '';
  if (typeof isoString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    return formatDate(isoString);
  }
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const time = formatTime(isoString);
  return time ? `${formatDate(isoString)}, ${time}` : formatDate(isoString);
};

