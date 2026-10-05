import { render } from 'react-testing-library';
import { SalesReport, SALES_COLUMNS } from './SalesReport';
import { buildSalesCsv } from './salesCsv';
import { filterSales, getSalesFilterError } from './salesFilters';

const sales = [
  {
    bookingId: 1272, ticketName: 'Normalny', ticketQuantity: 2, ticketPrice: 650, orderValue: 1800,
  },
  {
    bookingId: 1272, ticketName: 'Ulgowy', ticketQuantity: 1, ticketPrice: 500, orderValue: 1800,
  },
  {
    bookingId: 1273, ticketName: 'Normalny', ticketQuantity: 12, ticketPrice: 800, orderValue: 9600,
  },
];

it('shows the ticket name and actual quantity in aligned report columns', () => {
  const report = new SalesReport({ classes: {} });
  report.state = { ...report.state, sales: sales.slice(0, 1) };
  const view = render(report.renderTable({}));
  const headers = Array.from(view.container.querySelectorAll('thead th'));
  const cells = Array.from(view.container.querySelectorAll('tbody tr:first-child td'));
  expect(cells).toHaveLength(headers.length);
  [
    'Nazwa biletu', 'Liczba biletów', 'Cena biletu kupionego', 'Wartość zamówienia',
  ].forEach((label, index) => {
    const column = headers.findIndex(header => header.textContent.includes(label));
    expect(cells[column].textContent).toBe(['Normalny', '2', '6.50 zł', '18.00 zł'][index]);
  });
});

it('keeps the full discounted order value in CSV after filtering ticket lines', () => {
  const filtered = filterSales(sales, {
    ticketName: 'NORMAL', orderValueMin: '18,00', orderValueMax: '18.00',
  });
  expect(filtered).toEqual([sales[0]]);
  expect(buildSalesCsv(filtered, SALES_COLUMNS, ['bookingId', 'ticketPrice', 'orderValue']))
    .toBe('"ID";"Cena biletu kupionego";"Wartość zamówienia"\r\n"1272";"6.50 zł";"18.00 zł"');
});

it('distinguishes free orders from missing values and validates amount filters', () => {
  const rows = [{ orderValue: 0 }, { orderValue: null }, {}];
  expect(filterSales(rows, { orderValueMax: '0' })).toEqual([rows[0]]);
  expect(buildSalesCsv(rows, SALES_COLUMNS, ['orderValue']))
    .toBe('"Wartość zamówienia"\r\n"0.00 zł"\r\n""\r\n""');
  ['abc', '-1', '1,234'].forEach((value) => {
    expect(getSalesFilterError({ orderValueMin: value })).toBeTruthy();
    expect(filterSales(sales, { orderValueMin: value })).toEqual([]);
  });
  expect(getSalesFilterError({ orderValueMin: '19', orderValueMax: '18' })).toBeTruthy();
});

it('spans all columns when the report is empty', () => {
  const report = new SalesReport({ classes: {} });
  const view = render(report.renderTable({}));
  expect(view.container.querySelector('tbody td').colSpan).toBe(SALES_COLUMNS.length + 1);
});

it('filters by ticket name and exact quantity and exports both selected columns', () => {
  const filtered = filterSales(sales, { ticketName: 'NORMAL', ticketQuantity: ' 2 ' });
  expect(filtered).toEqual([sales[0]]);
  expect(buildSalesCsv(filtered, SALES_COLUMNS, ['bookingId', 'ticketName', 'ticketQuantity']))
    .toBe('"ID";"Nazwa biletu";"Liczba biletów"\r\n"1272";"Normalny";"2"');
});

it('does not invent a quantity when the API omits it', () => {
  const report = new SalesReport({ classes: {} });
  report.state = { ...report.state, sales: [{ bookingId: 1272 }] };
  const view = render(report.renderTable({}));
  const quantityColumn = SALES_COLUMNS.findIndex(column => column.key === 'ticketQuantity');
  expect(view.container.querySelectorAll('tbody td')[quantityColumn].textContent).toBe('-');
  expect(filterSales([{ bookingId: 1272 }], { ticketQuantity: '1' })).toEqual([]);
});
