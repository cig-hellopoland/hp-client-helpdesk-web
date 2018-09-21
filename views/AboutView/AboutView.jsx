import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import withStyles from '@material-ui/core/styles/withStyles';
import Link from 'next/link';
import Layout from 'components/Layout';

const styles = ({
  root: {
    padding: 16,
  },
});

const AboutView = ({ classes }) => (
  <Layout>
    <div className={classes.root}>
      <Link href="/" passHref>
        <Button component="a" variant="raised" color="primary">Home</Button>
      </Link>
    </div>
  </Layout>
);

AboutView.propTypes = {
  classes: PropTypes.shape({}).isRequired,
};

export default withStyles(styles)(AboutView);
