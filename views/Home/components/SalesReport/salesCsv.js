export const CSV_COLUMNS_STORAGE_KEY = 'hp.helpdesk.sales.csvColumns.v1';

export const selectCsvColumns = (columns, selectedKeys) => (
  columns.filter(column => selectedKeys.includes(column.key))
);

const escapeCsvValue = value => `"${String(value == null ? '' : value).replace(/"/g, '""')}"`;

export const buildSalesCsv = (sales, columns, selectedKeys) => {
  const selectedColumns = selectCsvColumns(columns, selectedKeys);
  if (!selectedColumns.length) return '';
  return [
    selectedColumns.map(column => column.label),
    ...sales.map(row => selectedColumns.map(column => column.value(row))),
  ].map(row => row.map(escapeCsvValue).join(';')).join('\r\n');
};

export const loadCsvColumns = (availableKeys) => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(CSV_COLUMNS_STORAGE_KEY));
    if (!Array.isArray(saved) || saved.some(key => typeof key !== 'string')) {
      return availableKeys.slice();
    }
    const selected = availableKeys.filter(key => saved.includes(key));
    // Preserve an intentionally empty choice; recover from obsolete saved keys.
    return selected.length || !saved.length ? selected : availableKeys.slice();
  } catch (error) {
    // Storage can be unavailable, including during server rendering.
    return availableKeys.slice();
  }
};

export const saveCsvColumns = (selectedKeys) => {
  try {
    window.localStorage.setItem(CSV_COLUMNS_STORAGE_KEY, JSON.stringify(selectedKeys));
  } catch (error) {
    // The current selection still works when the browser blocks local storage.
  }
};
