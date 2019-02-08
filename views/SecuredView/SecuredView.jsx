import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import Link from 'next/link';
import withAuth from 'services/auth/withAuth';
import Layout from 'components/Layout';

const styles = ({
  root: {
    padding: 16,
  },
});

const SecuredView = ({ classes }) => (
  <Layout>
    <div className={classes.root}>
      <Typography>Secured page</Typography>
      <Link href="/" passHref>
        <Button component="a" variant="contained" color="primary">Home</Button>
      </Link>
    </div>
  </Layout>
);

SecuredView.propTypes = {
  classes: PropTypes.shape({}).isRequired,
};

export default compose(
  withStyles(styles),
  withAuth({ redirectURL: '/signin?redirect=/secured ' }),
)(SecuredView);
