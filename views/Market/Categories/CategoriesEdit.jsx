import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _sortedUniq from 'lodash/sortedUniq';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import { withRouter } from 'next/router';
import {
  actions as categoriesActions,
  selectors as categoriesSelectors,
} from '@hello-poland/commons/redux/categories';
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

class CategoriesEdit extends React.Component {
  state = {
    availableTranslations: CONTENT_LANGUAGES,
    selectedTranslation: DEFAULT_LANGUAGE,
    snackbarOpen: false,
    snackbarMessage: '',
  };

  componentDidMount() {
    const {
      itemId, clearError, clearItem, error, item,
    } = this.props;

    if (item) {
      clearItem();
    }

    if (error) {
      clearError();
    }

    if (itemId) {
      this.handleFetchItem(itemId, DEFAULT_LANGUAGE);
    }
  }

  getFormValues = (item) => {
    const { itemId } = this.props;
    const { selectedTranslation } = this.state;

    if (item && itemId === item.id) {
      const { availableLanguageVersions } = item;
      const hasNewTranslation = !availableLanguageVersions.some(lng => lng === selectedTranslation);

      if (hasNewTranslation) {
        const { label, ...itemProps } = item;

        return { ...itemProps };
      }

      return { ...item };
    }

    return null;
  };

  handleFetchItemFailure = () => {
    const { clearError, error } = this.props;

    this.handleSnackbarOpen(error && error.message);

    if (clearError) {
      clearError();
    }
  };

  handleFetchItemSuccess = () => {
    const { item } = this.props;
    const { availableLanguageVersions, language } = item || {};

    this.setState({
      availableTranslations: availableLanguageVersions,
      selectedTranslation: language || DEFAULT_LANGUAGE,
    });
  };

  handleFetchItem = (itemId, language) => {
    const { fetchItem } = this.props;

    fetchItem({
      id: itemId,
      options: {
        headers: {
          'Content-Language': language,
        },
      },
      onFailure: this.handleFetchItemFailure,
      onSuccess: this.handleFetchItemSuccess,
    });
  };

  handleTranslationChange = (event) => {
    const { item } = this.props;
    const selectedTranslation = event.target.value;

    this.setState({ selectedTranslation });

    if (item && item.id) {
      this.handleFetchItem(item.id, selectedTranslation);
    }
  };

  handleTranslationCreate = (language) => {
    this.setState(state => ({
      availableTranslations: _sortedUniq([
        ...state.availableTranslations,
        language,
      ]),
      selectedTranslation: language,
    }));
  };

  handleTranslationDefaultChangeFailure = () => {
    const { clearError, error } = this.props;

    this.handleSnackbarOpen(error && error.message);

    if (clearError) {
      clearError();
    }
  };

  handleTranslationDefaultChangeSuccess = () => {
    const { selectedTranslation } = this.state;
    const { itemId } = this.props;

    this.handleFetchItem(itemId, selectedTranslation);
  };

  handleTranslationDefaultChange = () => {
    const { selectedTranslation } = this.state;
    const { itemId, changeDefaultTranslation } = this.props;
    const options = {
      headers: {
        'Content-Language': selectedTranslation,
      },
    };

    changeDefaultTranslation({
      id: itemId,
      options,
      onFailure: this.handleTranslationDefaultChangeFailure,
      onSuccess: this.handleTranslationDefaultChangeSuccess,
    });
  };

  handleTranslationDeleteFailure = () => {
    const { clearError, error } = this.props;

    this.handleSnackbarOpen(error && error.message);

    if (clearError) {
      clearError();
    }
  };

  handleTranslationDeleteSuccess = () => {
    const { itemId, item } = this.props;
    const { defaultLanguage } = item || {};

    this.handleFetchItem(itemId, defaultLanguage);
  };

  handleTranslationDelete = () => {
    const { selectedTranslation } = this.state;
    const { itemId, deleteTranslation } = this.props;

    deleteTranslation({
      id: itemId,
      onFailure: this.handleTranslationDeleteFailure,
      onSuccess: this.handleTranslationDeleteSuccess,
      pathParams: {
        languageVersion: selectedTranslation,
      },
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

  handleSubmitSuccess = () => {
    const { router } = this.props;

    router.push('/market/categories');
  };

  render() {
    const {
      availableTranslations, selectedTranslation, snackbarOpen, snackbarMessage,
    } = this.state;
    const { classes, item, itemId } = this.props;
    const { defaultLanguage } = item || {};

    const pageTitle = itemId ? 'Edycja kategorii' : 'Nowa kategoria';
    const hasLanguageActions = !!(itemId);

    return (
      <Layout>
        <Paper className={classes.root}>
          <Grid container justify="space-between">
            <Grid item>
              <Typography variant="h6">{pageTitle}</Typography>
            </Grid>
            <Grid item>
              <ContentTranslation
                actions={hasLanguageActions}
                TranslationPickerProps={{
                  defaultValue: defaultLanguage || DEFAULT_LANGUAGE,
                  items: availableTranslations || CONTENT_LANGUAGES,
                  onChange: this.handleTranslationChange,
                  value: selectedTranslation || DEFAULT_LANGUAGE,
                }}
                TranslationActionsProps={{
                  availableTranslations,
                  defaultTranslation: defaultLanguage,
                  selectedTranslation,
                  onCreateTranslation: this.handleTranslationCreate,
                  onDeleteTranslation: this.handleTranslationDelete,
                  onSetDefaultTranslation: this.handleTranslationDefaultChange,
                }}
              />
            </Grid>
          </Grid>
          <CategoryForm
            initialValues={this.getFormValues(item)}
            language={selectedTranslation}
            onSubmitSuccess={this.handleSubmitSuccess}
          />
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

CategoriesEdit.propTypes = {
  itemId: PropTypes.number,
  changeDefaultTranslation: PropTypes.func.isRequired,
  classes: PropTypes.shape({}).isRequired,
  clearError: PropTypes.func.isRequired,
  clearItem: PropTypes.func.isRequired,
  deleteTranslation: PropTypes.func.isRequired,
  error: PropTypes.shape({}),
  fetchItem: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number,
    label: PropTypes.string,
  }),
  router: PropTypes.shape({}).isRequired,
};

CategoriesEdit.defaultProps = {
  itemId: null,
  error: null,
  item: null,
};

const mapStateToProps = state => ({
  error: categoriesSelectors.getError(state),
  item: categoriesSelectors.getItem(state),
});

const mapDispatchToProps = {
  changeDefaultTranslation: categoriesActions.changeDefaultTranslation,
  clearError: categoriesActions.clearError,
  clearItem: categoriesActions.clearItem,
  deleteTranslation: categoriesActions.deleteTranslation,
  fetchItem: categoriesActions.fetchItem,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withRouter,
  withStyles(styles),
)(CategoriesEdit);
