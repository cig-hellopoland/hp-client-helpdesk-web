import yupBoolean from 'yup/lib/boolean';
import yupString from 'yup/lib/string';

const validDate = (value) => {
  if (!value) return true;
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) || value.slice(0, 4) === '0000') return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const seasonalClosureSchema = {
  seasonallyClosed: yupBoolean(),
  seasonalClosureFrom: yupString().test('date', 'Podaj poprawną datę.', validDate),
  seasonalClosureTo: yupString()
    .test('date', 'Podaj poprawną datę.', validDate)
    .test('order', 'Data końca nie może być wcześniejsza niż data początku.', function checkOrder(value) {
      return !value || !this.parent.seasonalClosureFrom || value >= this.parent.seasonalClosureFrom;
    }),
};

export default seasonalClosureSchema;
