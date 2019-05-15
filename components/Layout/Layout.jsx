import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Dashboard from '@material-ui/icons/Dashboard';
import Work from '@material-ui/icons/Work';
import { withRouter } from 'next/router';
import config from 'config';
import Content from './Content';
import Header from './Header';
import MenuDrawer from './MenuDrawer';

const title = config.public.name;

const MENU_ITEMS = [
  {
    label: 'Dashboard', href: '/', Icon: Dashboard,
  },
  {
    label: 'Partnerzy', href: '/partners', Icon: Work,
  },
];


const Layout = ({ children, ContentProps, router }) => (
  <Fragment>
    <Header documentTitle={title} />
    <Grid container>
      <MenuDrawer
        currentPath={router.asPath}
        menuItems={MENU_ITEMS}
      />
      <Content {...ContentProps}>
        {children}
      </Content>
    </Grid>
  </Fragment>
);

Layout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.object,
  ]).isRequired,
  ContentProps: PropTypes.shape({}),
  router: PropTypes.shape({}).isRequired,
};

Layout.defaultProps = {
  ContentProps: {},
};

export default withRouter(Layout);
