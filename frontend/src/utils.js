// ─── Shared utilities ─────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Build an absolute URL for a property image.
 * The backend stores images in /uploads/properties/<filename>
 * and saves only the filename in the DB.
 *
 * Handles three cases:
 *  1. null/undefined  → null (caller shows placeholder)
 *  2. Already a full URL (starts with http) → return as-is (legacy data)
 *  3. Just a filename → prepend backend base + /uploads/properties/
 *
 * @param {string|null|undefined} filenameOrUrl
 * @returns {string|null}
 */
export function getImageUrl(filenameOrUrl) {
  if (!filenameOrUrl) return null;
  if (filenameOrUrl.startsWith('http')) return filenameOrUrl;
  return `${API_BASE}/uploads/properties/${filenameOrUrl}`;
}

/**
 * Build an absolute URL for a profile picture.
 * @param {string|null|undefined} filename
 * @returns {string|null}
 */
export function getProfileUrl(filename) {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  return `${API_BASE}/uploads/profiles/${filename}`;
}

/**
 * Export data to a CSV file and trigger download.
 * @param {Array<Object>} data 
 * @param {string} filename 
 */
export function exportToCSV(data, filename) {
  if (!data || !data.length) {
    alert('No data to export.');
    return;
  }
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row)
      .map(val => `"${String(val || '').replace(/"/g, '""')}"`)
      .join(',')
  ).join('\n');
  const csv = `${headers}\n${rows}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
