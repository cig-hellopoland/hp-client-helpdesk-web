import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import config from 'config';
import Header from './Header';
import Content from './Content';

const title = config.public.name;

const Layout = ({ children }) => (
  <Fragment>
    <Header documentTitle={title} />
    <Content>
      {children}
    </Content>
  </Fragment>
);

Layout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.object,
  ]).isRequired,
};

export default Layout;
