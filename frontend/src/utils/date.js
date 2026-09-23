// Session dates are stored as plain 'YYYY-MM-DD'. `new Date('2025-01-05')` parses that as
// UTC midnight, which shows the previous day in timezones behind UTC — parse as local instead.
export const parseDate = (value) => {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
};

export const formatDate = (value) => parseDate(value)?.toDateString() ?? '—';
export const formatShortDate = (value) => parseDate(value)?.toLocaleDateString() ?? '—';
