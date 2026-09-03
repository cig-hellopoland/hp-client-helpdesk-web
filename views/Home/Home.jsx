import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Link from 'next/link';
import Layout from 'components/Layout';
import withAuth from 'services/auth/withAuth';
import { selectors as profileSelectors } from 'redux/profile';
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

const Home = ({ classes, profile }) => {
  const roles = (profile && profile.roles) || [];
  const technicalOnly = roles.length === 1 && roles.includes('HELPDESK_TECHNICAL');

  if (technicalOnly) {
    return (
      <Layout>
        <div className={classes.content}>
          <Typography variant="h6" gutterBottom>Panel techniczny</Typography>
          <Link href="/helpdesk/technical" passHref>
            <Button component="a" variant="contained" color="primary">Przejdź do stanu systemu</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
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
};

Home.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  profile: PropTypes.shape({}).isRequired,
};

const mapStateToProps = state => ({
  profile: profileSelectors.getProfile(state),
});

export default compose(
  withAuth(),
  connect(mapStateToProps),
  withStyles(styles),
)(Home);
