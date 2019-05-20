import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import withAuth from 'services/auth/withAuth';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Layout from 'components/Layout';
import AddPartnerForm from './components/PartnerForm';

const styles = theme => ({
  root: {
    flex: 1,
    padding: theme.spacing.unit * 2,
  },
});

const PartnerCreate = ({ classes }) => (
  <Layout>
    <Paper className={classes.root}>
      <AddPartnerForm />
    </Paper>
  </Layout>
);

PartnerCreate.propTypes = {
  classes: PropTypes.shape({}).isRequired,
};

export default compose(
  withAuth(),
  withStyles(styles),
)(PartnerCreate);
