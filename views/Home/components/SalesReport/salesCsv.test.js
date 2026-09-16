import {
  buildSalesCsv, loadCsvColumns, saveCsvColumns, CSV_COLUMNS_STORAGE_KEY,
} from './salesCsv';

const columns = [
  { key: 'bookingId', label: 'ID', value: row => row.bookingId },
  { key: 'eventName', label: 'Wydarzenie', value: row => row.eventName },
  { key: 'customerEmail', label: 'Email', value: row => row.customerEmail },
];
const keys = columns.map(column => column.key);
const sales = [{ bookingId: 778, eventName: 'Park; "Wodny"', customerEmail: 'test@example.com' }];

afterEach(() => {
  jest.restoreAllMocks();
  window.localStorage.clear();
});

describe('sales CSV column selection', () => {
  it('exports only selected columns, in report order regardless of selection order', () => {
    expect(buildSalesCsv(sales, columns, ['customerEmail', 'bookingId']))
      .toBe('"ID";"Email"\r\n"778";"test@example.com"');
  });

  it('quotes delimiters, double quotes and line breaks', () => {
    expect(buildSalesCsv(sales, columns, ['eventName']))
      .toBe('"Wydarzenie"\r\n"Park; ""Wodny"""');
    expect(buildSalesCsv([{ eventName: 'Pierwsza\nDruga' }], columns, ['eventName']))
      .toBe('"Wydarzenie"\r\n"Pierwsza\nDruga"');
  });

  it('keeps zero and writes empty cells for missing values', () => {
    expect(buildSalesCsv([{ bookingId: 0 }], columns, keys))
      .toBe('"ID";"Wydarzenie";"Email"\r\n"0";"";""');
  });

  it('exports selected headers when there are no matching rows', () => {
    expect(buildSalesCsv([], columns, ['customerEmail'])).toBe('"Email"');
  });

  it('does not produce CSV without valid selected columns', () => {
    expect(buildSalesCsv(sales, columns, [])).toBe('');
    expect(buildSalesCsv(sales, columns, ['unknown'])).toBe('');
  });

  it('ignores duplicate and obsolete keys', () => {
    expect(buildSalesCsv(sales, columns, ['bookingId', 'unknown', 'bookingId']))
      .toBe('"ID"\r\n"778"');
  });
});

describe('saved CSV preferences', () => {
  it('selects all columns by default', () => {
    expect(loadCsvColumns(keys)).toEqual(keys);
  });

  it('restores the selection in report order', () => {
    saveCsvColumns(['customerEmail', 'bookingId']);
    expect(loadCsvColumns(keys)).toEqual(['bookingId', 'customerEmail']);
  });

  it('remembers an intentionally empty choice', () => {
    saveCsvColumns([]);
    expect(loadCsvColumns(keys)).toEqual([]);
  });

  it.each(['broken JSON', '{}', '[42]', '["obsolete"]'])('recovers from invalid preferences: %s', (saved) => {
    window.localStorage.setItem(CSV_COLUMNS_STORAGE_KEY, saved);
    expect(loadCsvColumns(keys)).toEqual(keys);
  });

  it('keeps valid keys from an older selection', () => {
    saveCsvColumns(['bookingId', 'obsolete']);
    expect(loadCsvColumns(keys)).toEqual(['bookingId']);
  });

  it('remains usable when reading or writing storage is blocked', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(loadCsvColumns(keys)).toEqual(keys);
    expect(() => saveCsvColumns(['bookingId'])).not.toThrow();
  });
});
