import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { withRouter } from 'next/router';
import withAuth from 'services/auth/withAuth';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import NoSsr from '@material-ui/core/NoSsr';
import config from 'config';
import Content from './Content';
import Header from './Header';
import MenuDrawer from './MenuDrawer';
import menuItems from './menuItems';

const title = config.public.name;

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
              menuItems={menuItems}
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
