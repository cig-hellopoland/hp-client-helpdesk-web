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
import MailingForm from './components/MailingForm';
import SalesReport from './components/SalesReport';

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
  <div className={classes.content}>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Grid container direction="column">
          <Grid item className={classes.item}>
            <Typography variant="h6" gutterBottom>
              Statystyki sprzedaży
            </Typography>
            <SalesExport />
          </Grid>

          <Grid item className={classes.item}>
            <Typography variant="h6" gutterBottom>
              Promowane oferty
            </Typography>
            <PromotedSightEvents />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} md={4}>
        <Typography variant="h6" gutterBottom>
          Wyślij email z produktami
        </Typography>
        <MailingForm />
      </Grid>
    </Grid>

    <Grid container spacing={3}>
      <Grid item xs={12}>
        <SalesReport />
      </Grid>
    </Grid>
  </div>
</Layout>
);

Home.propTypes = {
  classes: PropTypes.shape({}).isRequired,
};

export default compose(
  withAuth(),
  withStyles(styles),
)(Home);
