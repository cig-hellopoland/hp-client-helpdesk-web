import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import { withRouter } from 'next/router';
import {
  actions as categoriesActions,
  selectors as categoriesSelectors,
} from 'redux/categories';
import withAuth from 'services/auth/withAuth';
import { CONTENT_LANGUAGES, DEFAULT_LANGUAGE } from 'utils/translations';
import Layout from 'components/Layout';
import ContentTranslation from 'components/ContentTranslation';
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
      this.handleFetchItem(categoryId, DEFAULT_LANGUAGE);
    }
  }

  handleFetchItemFailure = () => {
    const { clearError, error } = this.props;

    this.handleSnackbarOpen(error && error.message);

    if (clearError) {
      clearError();
    }
  };

  handleFetchItemSuccess = () => {
    const { item } = this.props;

    this.setState({ selectedLanguage: item.language || DEFAULT_LANGUAGE });
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
      onSuccess: this.handleFetchItemSuccess,
    });
  };

  handleLanguageChange = (event) => {
    const { item } = this.props;
    const selectedLanguage = event.target.value;

    this.setState({ selectedLanguage });

    if (item && item.id) {
      this.handleFetchItem(item.id, selectedLanguage);
    }
  };

  handleSnackbarOpen = message => this.setState({
    snackbarOpen: true,
    snackbarMessage: typeof message === 'string' ? message : 'Wystąpił nieznany błąd.',
  });

  handleSnackbarClose = () => this.setState({
    snackbarOpen: false,
    snackbarMessage: '',
  });

  handleSubmitSuccess = () => {
    const { router } = this.props;

    router.push('/market/categories/');
  };

  render() {
    const { snackbarOpen, snackbarMessage, selectedLanguage } = this.state;
    const { classes, item } = this.props;
    const { availableLanguageVersions, defaultLanguage } = item || {};

    const pageTitle = item && item.id ? 'Edycja kategorii' : 'Nowa kategoria';
    const hasLanguageActions = !!(item && item.id);

    return (
      <Layout>
        <Paper className={classes.root}>
          <Typography variant="h6">{pageTitle}</Typography>
          <ContentTranslation
            actions={hasLanguageActions}
            TranslationPickerProps={{
              defaultValue: defaultLanguage || DEFAULT_LANGUAGE,
              items: availableLanguageVersions || CONTENT_LANGUAGES,
              onChange: this.handleLanguageChange,
              value: selectedLanguage || DEFAULT_LANGUAGE,
            }}
            TranslationActionsProps={{
              availableTranslations: availableLanguageVersions,
              defaultTranslation: defaultLanguage,
              selectedTranslation: selectedLanguage,
              onCreateTranslation: () => console.log('create'),
              onDeleteTranslation: () => console.log('delete'),
              onSetDefaultTranslation: () => console.log('set default'),
            }}
          />
          <br />
          <CategoryForm initialValues={item} onSubmitSuccess={this.handleSubmitSuccess} />
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
  router: PropTypes.shape({}).isRequired,
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
  withRouter,
  withStyles(styles),
)(PartnerCreate);
