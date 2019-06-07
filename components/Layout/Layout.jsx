import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { withRouter } from 'next/router';
import withAuth from 'services/auth/withAuth';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import NoSsr from '@material-ui/core/NoSsr';
import DashboardIcon from '@material-ui/icons/Dashboard';
import DomainIcon from '@material-ui/icons/Domain';
import LocalPlayIcon from '@material-ui/icons/LocalPlay';
import PlaceIcon from '@material-ui/icons/Place';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import config from 'config';
import Content from './Content';
import Header from './Header';
import MenuDrawer from './MenuDrawer';

const title = config.public.name;

const MENU_ITEMS = [
  {
    label: 'Dashboard', href: '/', Icon: DashboardIcon,
  },
  {
    disabled: true, label: 'Sprzedaż', href: '/sales', Icon: ShoppingCartIcon,
  },
  {
    label: 'Partnerzy', href: '/partners', Icon: DomainIcon,
  },
  {
    disabled: true, label: 'Atrakcje', href: '/sights', Icon: PlaceIcon,
  },
  {
    disabled: true, label: 'Oferty', href: '/sight-events', Icon: LocalPlayIcon,
  },
];


const Layout = ({
  children, ContentProps, isAuthenticated, router,
}) => (
  <Fragment>
    <Header documentTitle={title} />
    <Grid container>
      <NoSsr fallback={<CircularProgress color="secondary" />}>
        {isAuthenticated
          && (
            <MenuDrawer
              currentPath={router.asPath}
              menuItems={MENU_ITEMS}
            />
          )
        }
      </NoSsr>
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
  isAuthenticated: PropTypes.bool.isRequired,
  router: PropTypes.shape({}).isRequired,
};

Layout.defaultProps = {
  ContentProps: {},
};

export default compose(
  withAuth(),
  withRouter,
)(Layout);
