import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import Link from 'next/link';
import Button from '@material-ui/core/Button';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Layout from 'components/Layout';
import withAuth from 'services/auth/withAuth';
import SalesExport from './components/SalesExport';

const styles = {
  content: {
    padding: 16,
  },
};

const HomeView = ({ classes }) => (
  <Layout>
    <Link href="/partners" passHref prefetch>
      <Button component="a">
        Partnerzy
      </Button>
    </Link>
    <div className={classes.content}>
      <Typography variant="h6" gutterBottom>Statystyki sprzedaży</Typography>
      <SalesExport />
    </div>
  </Layout>
);

HomeView.propTypes = {
  classes: PropTypes.shape({}).isRequired,
};

export default compose(
  withStyles(styles),
  withAuth(),
)(HomeView);
