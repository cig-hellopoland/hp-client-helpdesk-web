import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Layout from 'components/Layout';
import withAuth from 'services/auth/withAuth';

const styles = {
  content: {
    padding: 16,
  },
};

const HomeView = ({ classes }) => (
  <Layout>
    <div className={classes.content}>
      <Typography variant="subtitle1">
        You can edit
        {' '}
        <code>pages/index.js</code>
        {' '}
        now and app will automatically refresh :)
      </Typography>
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
