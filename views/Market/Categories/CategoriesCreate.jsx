import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import {
  actions as categoriesActions,
  selectors as categoriesSelectors,
} from 'redux/categories';
import withAuth from 'services/auth/withAuth';
import Layout from 'components/Layout';

const styles = theme => ({
  root: {
    flex: 1,
    padding: theme.spacing.unit * 2,
  },
});

class PartnerCreate extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <Layout>
        <Paper className={classes.root}>
          <div>omg!</div>
        </Paper>
      </Layout>
    );
  }
}


PartnerCreate.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  clearError: PropTypes.func.isRequired,
  fetchItem: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number,
    label: PropTypes.string,
  }),
};

PartnerCreate.defaultProps = {
  item: null,
};

const mapStateToProps = state => ({
  item: categoriesSelectors.getItem(state),
});

const mapDispatchToProps = {
  clearError: categoriesActions.clearError,
  fetchItem: categoriesActions.fetchItem,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withStyles(styles),
)(PartnerCreate);
