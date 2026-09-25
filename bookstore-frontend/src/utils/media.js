const API_BASE = 'http://localhost';

export function getImageUrl(path) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}