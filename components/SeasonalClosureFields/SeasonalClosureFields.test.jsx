import React from 'react';
import { Formik, Form } from 'formik';
import { render, fireEvent, wait } from 'react-testing-library';
import yupObject from 'yup/lib/object';
import SeasonalClosureFields from './index';
import seasonalClosureSchema from './validation';

const schema = yupObject().shape(seasonalClosureSchema);

it('reveals optional dates and submits the switch and dates together', async () => {
  const save = jest.fn();
  const view = render(
    <Formik
      initialValues={{ seasonallyClosed: false, seasonalClosureFrom: '', seasonalClosureTo: '' }}
      validationSchema={schema}
      onSubmit={save}
    >
      <Form>
        <SeasonalClosureFields />
        <button type="submit">Zapisz</button>
      </Form>
    </Formik>,
  );
  expect(view.container.querySelector('input[type="date"]')).toBeNull();
  fireEvent.click(view.getByLabelText('Sezonowo nieczynne'));
  const from = view.container.querySelector('input[name="seasonalClosureFrom"]');
  const to = view.container.querySelector('input[name="seasonalClosureTo"]');
  expect(from).not.toBeNull();
  fireEvent.change(from, { target: { value: '2026-11-01' } });
  fireEvent.change(to, { target: { value: '2027-03-31' } });
  fireEvent.click(view.getByText('Zapisz'));
  await wait(() => expect(save).toHaveBeenCalled());
  expect(save.mock.calls[0][0]).toEqual({
    seasonallyClosed: true, seasonalClosureFrom: '2026-11-01', seasonalClosureTo: '2027-03-31',
  });
});

it('accepts manual, one-sided and same-day ranges but rejects impossible and reversed dates', async () => {
  const values = { seasonallyClosed: true, seasonalClosureFrom: '', seasonalClosureTo: '' };
  await expect(schema.isValid(values)).resolves.toBe(true);
  await expect(schema.isValid({ ...values, seasonalClosureFrom: '2026-11-01' })).resolves.toBe(true);
  await expect(schema.isValid({ ...values, seasonalClosureTo: '2026-11-01' })).resolves.toBe(true);
  await expect(schema.isValid({ ...values, seasonalClosureFrom: '2026-11-01', seasonalClosureTo: '2026-11-01' })).resolves.toBe(true);
  await expect(schema.isValid({ ...values, seasonalClosureFrom: '2026-11-01', seasonalClosureTo: '2026-10-31' })).resolves.toBe(false);
  await expect(schema.isValid({ ...values, seasonalClosureFrom: '2026-02-30' })).resolves.toBe(false);
});
