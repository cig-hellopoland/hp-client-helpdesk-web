import React from 'react';
import { render } from 'react-testing-library';
import Header from './Header';

describe('Header', () => {
  it('should render with proper title', () => {
    const { getByTestId } = render(
      <Header documentTitle="test title" />,
    );

    expect(getByTestId('title')).toHaveTextContent('test title');
  });
});
