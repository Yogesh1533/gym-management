import DOMPurify from 'dompurify';

export const sanitize = (value) => {
  if (typeof value !== 'string') return value;
  return DOMPurify.sanitize(value.trim());
};

export const sanitizeObject = (obj) => {
  const clean = {};
  for (const key in obj) {
    clean[key] = sanitize(obj[key]);
  }
  return clean;
};
