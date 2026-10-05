import format from 'date-fns/format';

export const normalizeSearchValue = value => String(value == null ? '' : value)
  .toLocaleLowerCase('pl')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/ł/g, 'l');

const text = value => String(value == null ? '' : value).trim();

// Compare money in grosze, just like ticketPrice returned by the API.
const priceInGrosze = (value) => {
  const [whole, fraction = ''] = text(value).replace(',', '.').split('.');
  return Number(whole) * 100 + Number(`${fraction}00`.slice(0, 2));
};

const dateKey = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : format(date, 'yyyy-MM-dd');
};

export const getSalesFilterError = (filters) => {
  const min = text(filters.ticketPriceMin);
  const max = text(filters.ticketPriceMax);
  const orderMin = text(filters.orderValueMin);
  const orderMax = text(filters.orderValueMax);
  const from = text(filters.eventDateFrom);
  const to = text(filters.eventDateTo);
  if ((min && !/^\d+([.,]\d{1,2})?$/.test(min))
    || (max && !/^\d+([.,]\d{1,2})?$/.test(max))) {
    return 'Podaj cenę w złotych: liczbę nieujemną, maksymalnie dwa miejsca po przecinku.';
  }
  if (min && max && priceInGrosze(min) > priceInGrosze(max)) {
    return 'Cena minimalna nie może być większa od maksymalnej.';
  }
  if ((orderMin && !/^\d+([.,]\d{1,2})?$/.test(orderMin))
    || (orderMax && !/^\d+([.,]\d{1,2})?$/.test(orderMax))) {
    return 'Podaj wartość w złotych: nieujemną, z maksymalnie dwoma miejscami po przecinku.';
  }
  if (orderMin && orderMax && priceInGrosze(orderMin) > priceInGrosze(orderMax)) {
    return 'Minimalna wartość zamówienia nie może być większa od maksymalnej.';
  }
  if ([from, to].some(value => value && (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) || dateKey(`${value}T00:00:00`) !== value
  ))) {
    return 'Podaj poprawne daty wydarzenia.';
  }
  if (from && to && from > to) {
    return 'Data wydarzenia „Od” nie może być późniejsza niż „Do”.';
  }
  return '';
};

export const filterSales = (sales, filters) => {
  if (getSalesFilterError(filters)) return [];
  const id = text(filters.bookingId);
  const quantity = text(filters.ticketQuantity);
  const from = text(filters.eventDateFrom);
  const to = text(filters.eventDateTo);
  const min = text(filters.ticketPriceMin);
  const max = text(filters.ticketPriceMax);
  const orderMin = text(filters.orderValueMin);
  const orderMax = text(filters.orderValueMax);
  const textKeys = ['sightEventName', 'objectName', 'ticketName', 'customerName', 'customerEmail'];

  return sales.filter((row) => {
    if (id && String(row.bookingId) !== id) return false;
    if (quantity && (row.ticketQuantity == null || String(row.ticketQuantity) !== quantity)) {
      return false;
    }
    if (filters.status && row.status !== filters.status) return false;
    if (from || to) {
      const date = dateKey(row.eventDate);
      if (!date || (from && date < from) || (to && date > to)) return false;
    }
    if (min || max) {
      if (row.ticketPrice == null || !Number.isFinite(Number(row.ticketPrice))) return false;
      if (min && Number(row.ticketPrice) < priceInGrosze(min)) return false;
      if (max && Number(row.ticketPrice) > priceInGrosze(max)) return false;
    }
    if (orderMin || orderMax) {
      if (row.orderValue == null || !Number.isFinite(Number(row.orderValue))) return false;
      if (orderMin && Number(row.orderValue) < priceInGrosze(orderMin)) return false;
      if (orderMax && Number(row.orderValue) > priceInGrosze(orderMax)) return false;
    }
    return textKeys.every(key => normalizeSearchValue(row[key])
      .includes(normalizeSearchValue(filters[key]).trim()));
  });
};
