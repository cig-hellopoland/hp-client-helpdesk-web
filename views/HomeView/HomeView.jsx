import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Link from 'next/link';
import Layout from 'components/Layout';
import { actions as profileActions } from 'redux/profile';
import { actions, selectors } from './redux/counter';

const styles = {
  content: {
    padding: 16,
  },
};

const HomeView = ({
  classes, count, add, subtract, reset, fetchProfile,
}) => (
  <Layout>
    <div className={classes.content}>
      <Typography variant="subtitle1">
        You can edit
        {' '}
        <code>pages/index.js</code>
        {' '}
        now and app will automatically refresh :)
      </Typography>
      <Link href="/about" passHref>
        <Button component="a" variant="contained" color="primary">About</Button>
      </Link>
      <Link href="/movies" passHref>
        <Button component="a" variant="contained" color="primary">Movies</Button>
      </Link>
      <Link href="/secured" passHref>
        <Button component="a" variant="contained" color="primary">Secured</Button>
      </Link>
      <Button component="a" variant="contained" color="primary" onClick={() => fetchProfile()}>Me</Button>
      <Divider />
      <div>
        <Typography>
          Count:
          {count}
        </Typography>
      </div>
      <Button onClick={add}>Add</Button>
      <Button onClick={subtract}>Subtract</Button>
      <Button onClick={reset}>Reset</Button>
    </div>
  </Layout>
);

HomeView.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  count: PropTypes.number.isRequired,
  add: PropTypes.func.isRequired,
  subtract: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  fetchProfile: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  count: selectors.getCount(state),
});

const mapDispatchToProps = dispatch => ({
  add: () => dispatch(actions.add()),
  subtract: () => dispatch(actions.subtract()),
  reset: () => dispatch(actions.reset()),
  fetchProfile: () => dispatch(profileActions.fetchProfile()),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(HomeView);
