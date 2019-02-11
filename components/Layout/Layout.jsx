import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import config from 'config';
import Header from './Header';
import Content from './Content';

const title = config.public.name;

const Layout = ({ children, ContentProps }) => (
  <Fragment>
    <Header documentTitle={title} />
    <Content {...ContentProps}>
      {children}
    </Content>
  </Fragment>
);

Layout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.object,
  ]).isRequired,
  ContentProps: PropTypes.shape({}),
};

Layout.defaultProps = {
  ContentProps: {},
};

export default Layout;
