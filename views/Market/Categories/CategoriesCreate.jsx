import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import {
  actions as categoriesActions,
  selectors as categoriesSelectors,
} from 'redux/categories';
import withAuth from 'services/auth/withAuth';
import Layout from 'components/Layout';
import CategoryForm from './components/CategoryForm';

const styles = theme => ({
  root: {
    flex: 1,
    padding: theme.spacing.unit * 2,
  },
});

class PartnerCreate extends React.Component {
  state = {
    snackbarOpen: false,
    snackbarMessage: '',
  };

  componentDidMount() {
    const {
      categoryId, clearError, clearItem, error, item,
    } = this.props;

    if (item) {
      clearItem();
    }

    if (error) {
      clearError();
    }

    if (categoryId) {
      this.handleFetchItem(categoryId, 'pl-PL');
    }
  }

  handleFetchItemFailure = () => {
    const { clearError, error } = this.props;

    this.handleSnackbarOpen(error && error.message);

    if (clearError) {
      clearError();
    }
  };

  handleFetchItem = (categoryId, language) => {
    const { fetchItem } = this.props;

    fetchItem({
      id: categoryId,
      options: {
        headers: {
          'Content-Language': language,
        },
      },
      onFailure: this.handleFetchItemFailure,
    });
  };

  handleSnackbarOpen = message => this.setState({
    snackbarOpen: true,
    snackbarMessage: typeof message === 'string' ? message : 'Wystąpił nieznany błąd.',
  });

  handleSnackbarClose = () => this.setState({
    snackbarOpen: false,
    snackbarMessage: '',
  });

  render() {
    const { snackbarOpen, snackbarMessage } = this.state;
    const { classes, item } = this.props;

    const pageTitle = item && item.id ? 'Edycja kategorii' : 'Nowa kategoria';

    return (
      <Layout>
        <Paper className={classes.root}>
          <Typography variant="h6">{pageTitle}</Typography>
          <CategoryForm initialValues={item} />
          <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open={snackbarOpen}
            onClose={this.handleSnackbarClose}
            ContentProps={{
              'aria-describedby': 'message-id',
            }}
            message={snackbarMessage}
          />
        </Paper>
      </Layout>
    );
  }
}

PartnerCreate.propTypes = {
  categoryId: PropTypes.number,
  classes: PropTypes.shape({}).isRequired,
  clearError: PropTypes.func.isRequired,
  clearItem: PropTypes.func.isRequired,
  error: PropTypes.shape({}),
  fetchItem: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number,
    label: PropTypes.string,
  }),
};

PartnerCreate.defaultProps = {
  categoryId: null,
  error: null,
  item: null,
};

const mapStateToProps = state => ({
  error: categoriesSelectors.getError(state),
  item: categoriesSelectors.getItem(state),
});

const mapDispatchToProps = {
  clearError: categoriesActions.clearError,
  clearItem: categoriesActions.clearItem,
  fetchItem: categoriesActions.fetchItem,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withStyles(styles),
)(PartnerCreate);
