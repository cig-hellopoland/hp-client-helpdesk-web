import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Layout from 'components/Layout';
import withAuth from 'services/auth/withAuth';
import SalesExport from './components/SalesExport';
import PromotedSightEvents from './components/PromotedSightEvents';

const styles = {
  content: {
    padding: 16,
  },
  item: {
    marginBottom: 24,
  },
};

const Home = ({ classes }) => (
  <Layout>
    <Grid container direction="column" className={classes.content}>
      <Grid item md={4} className={classes.item}>
        <Typography variant="h6" gutterBottom>Statystyki sprzedaży</Typography>
        <SalesExport />
      </Grid>
      <Grid item md={4} className={classes.item}>
        <Typography variant="h6" gutterBottom>Promowane oferty</Typography>
        <PromotedSightEvents />
      </Grid>
    </Grid>
  </Layout>
);

Home.propTypes = {
  classes: PropTypes.shape({}).isRequired,
};

export default compose(
  withStyles(styles),
  withAuth(),
)(Home);
