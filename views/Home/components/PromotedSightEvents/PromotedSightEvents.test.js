import React from 'react';
import { render, fireEvent, wait } from 'react-testing-library';
import { PromotedSightEvents } from './PromotedSightEvents';

function setup(count = 3) {
  const offers = Array.from({ length: 9 }, (_, i) => ({ id: i + 1, name: `Oferta ${i + 1}` }));
  let selected = offers.slice(0, count).map((item, i) => ({ ...item, promotion: i + 1 }));
  const client = jest.fn(async ({ method, url, data }) => {
    if (method === 'post') {
      const id = Number(url.split('/')[2]);
      selected = [...selected, {
        ...offers.find(item => item.id === id), promotion: selected.length + 1,
      }];
    } else if (method === 'delete') {
      selected = selected.filter(item => item.id !== Number(url.split('/')[2]));
      selected = selected.map((item, i) => ({ ...item, promotion: i + 1 }));
    } else if (method === 'put') {
      selected = data.map((id, i) => ({
        ...selected.find(item => item.id === id), promotion: i + 1,
      }));
    }
    return { status: 200 };
  });
  client.get = jest.fn(async url => ({
    data: { items: url === '/sight-events/promoted' ? selected.slice() : offers.slice() },
  }));
  const view = render(React.createElement(PromotedSightEvents, {
    classes: {}, httpClient: client,
  }));
  const ready = amount => wait(() => expect(view.getByText(`Promowane oferty: ${amount} / 8`))
    .toBeInTheDocument());
  const add = async (id) => {
    fireEvent.click(view.getByText('Dodaj ofertę'));
    fireEvent.click(document.querySelector('[aria-haspopup="true"]'));
    fireEvent.click(view.getByText(`Oferta ${id}`));
    fireEvent.click(view.getByText('Dodaj'));
    await ready(id);
  };
  return {
    ...view, client, ready, add, selected: () => selected,
  };
}

it('adds fourth through eighth offers without a position field and disables addition at eight', async () => {
  const view = setup();
  await view.ready(3);
  for (let id = 4; id <= 8; id += 1) {
    // Each addition must complete before the next click, as in the UI.
    // eslint-disable-next-line no-await-in-loop
    await view.add(id);
  }
  expect(view.getByText('Dodaj ofertę').closest('button')).toBeDisabled();
  expect(view.client).toHaveBeenCalledTimes(5);
  expect(view.selected().map(item => item.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect(view.queryByText('Pozycja (1–8)')).not.toBeInTheDocument();
});

it('does not offer already promoted items in the add dialog', async () => {
  const view = setup();
  await view.ready(3);
  fireEvent.click(view.getByText('Dodaj ofertę'));
  fireEvent.click(document.querySelector('[aria-haspopup="true"]'));
  const options = Array.from(document.querySelectorAll('[role="option"]'));
  expect(options.map(item => item.textContent)).toEqual([
    'Oferta 4', 'Oferta 5', 'Oferta 6', 'Oferta 7', 'Oferta 8', 'Oferta 9',
  ]);
});

it('saves drag-and-drop order in one request, retaining all selected offers', async () => {
  const view = setup(8);
  await view.ready(8);
  fireEvent.click(view.getByText('Ustal kolejność'));
  const rows = document.querySelectorAll('[draggable="true"]');
  fireEvent.dragStart(rows[7], { dataTransfer: { setData: jest.fn() } });
  fireEvent.dragOver(rows[0], { dataTransfer: {} });
  fireEvent.drop(rows[0]);
  fireEvent.click(view.getByText('Zapisz'));
  await wait(() => expect(view.queryByText('Ustal kolejność promowanych ofert')).not.toBeInTheDocument());
  expect(view.client).toHaveBeenCalledTimes(1);
  expect(view.client).toHaveBeenCalledWith(expect.objectContaining({
    method: 'put', url: '/sight-events/promoted/order', data: [8, 1, 2, 3, 4, 5, 6, 7],
  }));
  await view.ready(8);
});

it('cancels reordered draft without changing the server list', async () => {
  const view = setup();
  await view.ready(3);
  fireEvent.click(view.getByText('Ustal kolejność'));
  const rows = document.querySelectorAll('[draggable="true"]');
  fireEvent.dragStart(rows[0], { dataTransfer: { setData: jest.fn() } });
  fireEvent.drop(view.getByText('Upuść na koniec listy'));
  fireEvent.click(view.getByText('Anuluj'));
  expect(view.client).not.toHaveBeenCalled();
  expect(view.selected().map(item => item.id)).toEqual([1, 2, 3]);
});

it('enables adding again after removing one of eight offers', async () => {
  const view = setup(8);
  await view.ready(8);
  fireEvent.click(view.getByLabelText('Usuń promocję: Oferta 2'));
  fireEvent.click(view.getByText('Usuń'));
  await view.ready(7);
  expect(view.getByText('Dodaj ofertę').closest('button')).not.toBeDisabled();
  expect(view.selected().map(item => item.id)).toEqual([1, 3, 4, 5, 6, 7, 8]);
});

it('keeps the dialog and selected offers on a rejected order save', async () => {
  const view = setup();
  await view.ready(3);
  view.client.mockRejectedValueOnce({ response: { data: { message: 'Lista została zmieniona.' } } });
  fireEvent.click(view.getByText('Ustal kolejność'));
  fireEvent.click(view.getByText('Zapisz'));
  await wait(() => expect(view.getByText('Lista została zmieniona.')).toBeInTheDocument());
  expect(view.getByText('Ustal kolejność promowanych ofert')).toBeInTheDocument();
  expect(view.selected()).toHaveLength(3);
});

it('blocks editing when refresh fails instead of showing a false successful update', async () => {
  const view = setup();
  await view.ready(3);
  expect(view.queryByText('Odśwież')).not.toBeInTheDocument();
  expect(view.queryByText('Spróbuj ponownie')).not.toBeInTheDocument();
  view.client.get.mockRejectedValueOnce(new Error('offline'));
  fireEvent.click(view.getByLabelText('Usuń promocję: Oferta 3'));
  fireEvent.click(view.getByText('Usuń'));
  await wait(() => expect(view.getByText(/Nie udało się pobrać/)).toBeInTheDocument());
  expect(view.getByText('Dodaj ofertę').closest('button')).toBeDisabled();
  expect(view.getByText('Ustal kolejność').closest('button')).toBeDisabled();
  fireEvent.click(view.getByText('Spróbuj ponownie'));
  await view.ready(2);
  expect(view.queryByText('Spróbuj ponownie')).not.toBeInTheDocument();
  expect(view.queryByText(/Nie udało się pobrać/)).not.toBeInTheDocument();
  expect(view.getByText('Dodaj ofertę').closest('button')).not.toBeDisabled();
});
