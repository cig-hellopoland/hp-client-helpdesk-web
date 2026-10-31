import React from 'react';
import { render, fireEvent, wait } from 'react-testing-library';
import { SightEventEdit } from './SightEventEdit';

const mockSave = jest.fn();

jest.mock('config', () => ({ public: {} }));
jest.mock('components/Layout', () => ({ children }) => children);
jest.mock('components/ContentTranslation', () => () => null);
jest.mock('services/auth/withAuth', () => () => Component => Component);
jest.mock('./components/SightEventMultimediaForm', () => () => null);
jest.mock('./components/TicketPoolDefinitionsList', () => () => null);
jest.mock('./components/SightEventForm', () => {
  const ReactModule = jest.requireActual('react');
  const { Formik } = jest.requireActual('formik');
  return props => ReactModule.createElement(
    Formik,
    { ...props.FormikProps, initialValues: props.initialValues, onSubmit: mockSave },
    ({ values, handleChange }) => ReactModule.createElement('input', {
      'aria-label': 'Nazwa oferty', name: 'name', value: values.name || '', onChange: handleChange,
    }),
  );
});

const tags = [
  {
    id: 1, label: 'muzeum', restricted: false, iconUrl: '/museum.svg',
  },
  {
    id: 2, label: 'dla rodziny', restricted: false, iconUrl: '/family.svg',
  },
  {
    id: 3, label: 'polecane', restricted: true, iconUrl: '/star.svg',
  },
];
const categories = [
  { id: 4, label: 'Kultura', restricted: false },
  { id: 5, label: 'Atrakcje', restricted: true },
];

function setup() {
  const actions = {};
  [
    'changeDefaultTranslation', 'clearError', 'clearItem', 'createTicketPoolDefinition',
    'deleteItemCategory', 'deleteItemTag', 'deleteTicketPoolDefinition', 'deleteTranslation',
    'fetchCategoriesList', 'fetchItem', 'fetchTagsList', 'updateItem', 'updateItemCategory',
    'updateItemTag', 'updateTicketPoolDefinition',
  ].forEach((name) => { actions[name] = jest.fn(); });
  return render(
    <SightEventEdit
      {...actions}
      classes={{}}
      categoriesList={categories}
      tagsList={tags}
      profile={{ roles: ['ADMIN'] }}
      router={{ push: jest.fn() }}
      sightId={349}
    />,
  );
}

async function add(view, section, label) {
  fireEvent.click(view.getAllByTitle('Dodaj')[section]);
  fireEvent.click(document.querySelector('[role="dialog"] [aria-haspopup="true"]'));
  fireEvent.click(view.getByText(label));
  fireEvent.click(view.getByText('Dodaj'));
  await wait(() => expect(document.querySelector('[role="dialog"]')).toBeNull());
}

const assignedLabels = view => Array.from(view.container.querySelectorAll('tbody tr'))
  .map(row => row.textContent.replace('Usuń', '').replace(/^\d+/, ''));

beforeEach(() => mockSave.mockClear());

it('shows each tag immediately and saves the last selection with other form values', async () => {
  const view = setup();
  fireEvent.change(view.getByLabelText('Nazwa oferty'), { target: { value: 'Nowa oferta' } });
  await add(view, 2, 'muzeum');
  expect(assignedLabels(view)).toEqual(['muzeum']);
  await add(view, 2, 'dla rodziny');
  expect(assignedLabels(view)).toEqual(['dla rodziny', 'muzeum']);
  await add(view, 3, 'polecane');
  expect(assignedLabels(view)).toEqual(['dla rodziny', 'muzeum', 'polecane']);
  fireEvent.click(view.getByText('Zapisz'));
  await wait(() => expect(mockSave).toHaveBeenCalled());
  expect(mockSave.mock.calls[0][0]).toEqual(expect.objectContaining({
    name: 'Nowa oferta', sightId: 349, tags, categories: [],
  }));
});

it('removes a tag immediately and makes it available to select again', async () => {
  const view = setup();
  await add(view, 2, 'muzeum');
  await add(view, 2, 'dla rodziny');
  fireEvent.click(view.getByText('muzeum').closest('tr').querySelector('button'));
  expect(assignedLabels(view)).toEqual(['dla rodziny']);
  await add(view, 2, 'muzeum');
  expect(assignedLabels(view)).toEqual(['dla rodziny', 'muzeum']);
  fireEvent.click(view.getByText('Zapisz'));
  await wait(() => expect(mockSave).toHaveBeenCalled());
  expect(mockSave.mock.calls[0][0].tags.map(({ id }) => id)).toEqual([2, 1]);
});

it('updates partner and administrator categories immediately using the same form handlers', async () => {
  const view = setup();
  await add(view, 0, 'Kultura');
  expect(assignedLabels(view)).toEqual(['Kultura']);
  await add(view, 1, 'Atrakcje');
  expect(assignedLabels(view)).toEqual(['Kultura', 'Atrakcje']);
  fireEvent.click(view.getByText('Kultura').closest('tr').querySelector('button'));
  expect(assignedLabels(view)).toEqual(['Atrakcje']);
  fireEvent.click(view.getByText('Zapisz'));
  await wait(() => expect(mockSave).toHaveBeenCalled());
  expect(mockSave.mock.calls[0][0].categories).toEqual([categories[1]]);
});
