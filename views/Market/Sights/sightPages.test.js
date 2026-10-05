import React from 'react';
import { render } from 'react-testing-library';

jest.mock('views/Market/Sights/SightEdit', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

describe('sight page navigation', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it.each([
    ['edit', 'create'],
    ['create', 'edit'],
  ])('keeps edit ID after loading %s then %s', (first, second) => {
    const pages = {};
    [first, second].forEach((page) => {
      // Load both pages in one module cache, as during client-side navigation.
      // eslint-disable-next-line global-require, import/no-dynamic-require
      pages[page] = require(`../../../pages/market/sights/${page}`).default;
    });

    expect(pages.edit.getInitialProps({
      query: {
        itemId: '354', partnerId: '12', tab: 'offers', successMessage: 'Zapisano',
      },
    })).toEqual({
      itemId: 354,
      partnerId: 12,
      tab: 'offers',
      successMessage: 'Zapisano',
    });
    expect(pages.create.getInitialProps({
      query: { itemId: '354', partnerId: '12', returnTo: '/market/sights' },
    })).toEqual({ itemId: null, partnerId: 12, returnTo: '/market/sights' });
  });

  it.each(['edit', 'create'])('passes %s page props to the sight form view', (page) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const Page = require(`../../../pages/market/sights/${page}`).default;
    // eslint-disable-next-line global-require
    const SightEdit = require('./SightEdit').default;
    const props = Page.getInitialProps({ query: { itemId: '354', partnerId: '12' } });

    render(React.createElement(Page, props));

    expect(SightEdit.mock.calls[0][0]).toEqual(props);
  });
});
