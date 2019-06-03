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
import MailingForm from './components/MailingForm/Form';

const styles = {
  content: {
    padding: 16,
  },
};

const HomeView = ({ classes }) => (
  <Layout>
    <Grid container wrap="nowrap" className={classes.content}>
      <Grid item md={4}>
        <Typography variant="h6" gutterBottom>Statystyki sprzedaży</Typography>
        <SalesExport />
        <Typography variant="h6" gutterBottom>Promowane oferty</Typography>
        <PromotedSightEvents />
      </Grid>
      <Grid item md={4}>
        <Typography variant="h6" gutterBottom>Wyślij email z biletami</Typography>
        <MailingForm />
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
