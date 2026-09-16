import { filterSales, getSalesFilterError } from './salesFilters';

const sales = [
  {
    bookingId: 77,
    eventDate: '2026-09-07T23:59:00',
    ticketPrice: 10010,
    customerName: 'Paweł Żółć',
    customerEmail: 'test@example.com',
    sightEventName: 'Park Wodny',
    objectName: 'Julinek',
    status: 'CONFIRMED',
  },
  {
    bookingId: 777, eventDate: '2026-09-08T00:01:00', ticketPrice: 21000, status: 'CANCELLED',
  },
  {
    bookingId: 78, eventDate: '2026-09-06T12:00:00', ticketPrice: 0, status: 'BOOKED',
  },
  { bookingId: 79, eventDate: null, ticketPrice: null },
];
const ids = filters => filterSales(sales, filters).map(row => row.bookingId);

describe('sales column filters', () => {
  it('matches the entire booking ID, ignoring surrounding whitespace', () => {
    expect(ids({ bookingId: ' 77 ' })).toEqual([77]);
  });

  it('includes both boundary dates and the whole final day', () => {
    expect(ids({ eventDateFrom: '2026-09-06', eventDateTo: '2026-09-07' })).toEqual([77, 78]);
  });

  it('supports either event date boundary by itself', () => {
    expect(ids({ eventDateFrom: '2026-09-07' })).toEqual([77, 777]);
    expect(ids({ eventDateTo: '2026-09-06' })).toEqual([78]);
  });

  it('compares prices numerically in złoty, including both boundaries', () => {
    expect(ids({ ticketPriceMin: '100,10', ticketPriceMax: '210.00' })).toEqual([77, 777]);
    expect(ids({ ticketPriceMin: '100.10', ticketPriceMax: '100,10' })).toEqual([77]);
  });

  it('supports one-sided price ranges and zero without treating missing prices as zero', () => {
    expect(ids({ ticketPriceMin: '100' })).toEqual([77, 777]);
    expect(ids({ ticketPriceMax: '0' })).toEqual([78]);
    expect(ids({ ticketPriceMin: '0' })).toEqual([77, 777, 78]);
  });

  it('combines dates, prices, text and status filters', () => {
    expect(ids({
      eventDateFrom: '2026-09-07',
      ticketPriceMax: '101',
      status: 'CONFIRMED',
      customerName: 'pawel zolc',
      customerEmail: 'EXAMPLE',
      sightEventName: 'wodny',
      objectName: 'jul',
    })).toEqual([77]);
    expect(ids({ bookingId: '77', status: 'CANCELLED' })).toEqual([]);
  });

  it('returns every row after clearing filters, including missing values', () => {
    expect(filterSales(sales, {})).toEqual(sales);
    expect(filterSales(sales, { ticketPriceMin: ' ', eventDateTo: '' })).toEqual(sales);
  });

  it('leaves purchase date filtering to the report request', () => {
    expect(filterSales(sales, { purchaseDate: 'unused' })).toEqual(sales);
  });

  it.each(['abc', '-1', '1,234', '1.2.3'])('rejects an invalid price: %s', (value) => {
    expect(getSalesFilterError({ ticketPriceMin: value })).toBeTruthy();
    expect(ids({ ticketPriceMin: value })).toEqual([]);
  });

  it('rejects reversed ranges with readable messages', () => {
    expect(getSalesFilterError({ ticketPriceMin: '20', ticketPriceMax: '10' }))
      .toBe('Cena minimalna nie może być większa od maksymalnej.');
    expect(getSalesFilterError({ eventDateFrom: '2026-09-08', eventDateTo: '2026-09-07' }))
      .toBe('Data wydarzenia „Od” nie może być późniejsza niż „Do”.');
  });

  it('rejects invalid calendar dates and excludes missing or invalid row dates', () => {
    expect(getSalesFilterError({ eventDateFrom: '2026-02-30' })).toBeTruthy();
    expect(filterSales([{ eventDate: 'invalid' }], { eventDateFrom: '2026-01-01' })).toEqual([]);
  });
});
