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
import FormWrapper from './components/MailingForm/FormWrapper';

const styles = {
  content: {
    padding: 16,
  },
};

const HomeView = ({ classes }) => (
  <Layout>
    <Grid container direction="row" wrap="nowrap" className={classes.content}>
      <Grid item md={4}>
        <Typography variant="h6" gutterBottom>Statystyki sprzedaży</Typography>
        <SalesExport />
        <Typography variant="h6" gutterBottom>Promowane oferty</Typography>
        <PromotedSightEvents />
      </Grid>
      <Grid item md={4}>
        <FormWrapper />
      </Grid>
    </Grid>
  </Layout>
);

HomeView.propTypes = {
  classes: PropTypes.shape({}).isRequired,
};

export default compose(
  withStyles(styles),
  withAuth(),
)(HomeView);
