import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _sortedUniq from 'lodash/sortedUniq';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { withRouter } from 'next/router';
import {
  actions as sightsActions,
  selectors as sightsSelectors,
} from '@hello-poland/commons/redux/sights';
import withAuth from 'services/auth/withAuth';
import { CONTENT_LANGUAGES, DEFAULT_LANGUAGE } from 'utils/translations';
import Layout from 'components/Layout';
import ContentTranslation from 'components/ContentTranslation';
import CategoriesForm from 'components/CategoriesForm';
import SightForm from './components/SightForm';
import SightMultimediaForm from './components/SightMultimediaForm';

const styles = theme => ({
  root: {
    flex: 1,
    minHeight: '100%',
    padding: theme.spacing.unit * 2,
  },
  section: {
    marginBottom: theme.spacing.unit * 3,
  },
});

class SightEdit extends React.Component {
  baseURL = '/market/sight-events';

  state = {
    availableTranslations: CONTENT_LANGUAGES,
    selectedTab: 0,
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
      const hasNewTranslation = availableLanguageVersions
        && !availableLanguageVersions.some(lng => lng === selectedTranslation);

      if (hasNewTranslation) {
        const { label, ...itemProps } = item;

        return { ...itemProps };
      }

      return { ...item };
    }

    return null;
  };

  getMultimediaFromItem = (item) => {
    const { mainImage, pdfAttachment } = item;
    const data = [];

    if (mainImage) {
      data.push({
        createdBy: '',
        createdDate: '',
        id: 1,
        modifiedBy: '',
        modifiedDate: '',
        name: 'mainImage',
        path: '/home/hpl/var/DMS/omg/1234.jpg',
        size: 12345,
        type: 'image/jpeg',
        downloadUrl: mainImage,
      });
    }

    if (pdfAttachment) {
      data.push({
        ...pdfAttachment,
        createdBy: '',
        createdDate: '',
        modifiedBy: '',
        modifiedDate: '',
        size: 12345,
        type: 'application/pdf',
      });
    }

    return data;
  };

  setSelectedTab = (event, selectedTab) => this.setState({ selectedTab });

  handleFetchItemFailure = () => this.handleRequestFailure();

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

  handleRequestFailure = () => {
    const { clearError, error } = this.props;

    this.handleSnackbarOpen(error && error.message);

    if (clearError) {
      clearError();
    }
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

  handleTranslationDefaultChangeFailure = () => this.handleRequestFailure();

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

  handleTranslationDeleteFailure = () => this.handleRequestFailure();

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

  render() {
    const {
      availableTranslations, selectedTab, selectedTranslation, snackbarOpen, snackbarMessage,
    } = this.state;
    const { classes, item, itemId } = this.props;
    const { defaultLanguage } = item || {};

    const pageTitle = 'Edycja atrakcji';
    const hasLanguageActions = !!(item && item.id);

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
          <Tabs
            className={classes.section}
            onChange={this.setSelectedTab}
            indicatorColor="primary"
            textColor="primary"
            value={selectedTab}
          >
            <Tab label="Szczegóły" />
            <Tab label="Kategorie" />
            <Tab label="Multimedia" />
            <Tab label="Komentarze" disabled />
          </Tabs>
          {selectedTab === 0
            && (
              <SightForm
                initialValues={this.getFormValues(item)}
                language={selectedTranslation}
              />
            )
          }
          {selectedTab === 1
            && (
              <CategoriesForm items={item.categories} />
            )
          }
          {selectedTab === 2
            && (
              <SightMultimediaForm
                data={this.getMultimediaFromItem(item)}
                defaultTranslation={defaultLanguage}
                itemId={itemId}
                onFailure={() => this.handleRequestFailure()}
                onSuccess={() => this.handleFetchItem(itemId, selectedTranslation)}
                translation={selectedTranslation}
              />
            )
          }
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

SightEdit.propTypes = {
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

SightEdit.defaultProps = {
  itemId: null,
  error: null,
  item: null,
};

const mapStateToProps = state => ({
  error: sightsSelectors.getError(state),
  item: sightsSelectors.getSight(state),
});

const mapDispatchToProps = {
  changeDefaultTranslation: sightsActions.changeDefaultTranslation,
  clearError: sightsActions.clearError,
  clearItem: sightsActions.clearItem,
  deleteTranslation: sightsActions.deleteTranslation,
  fetchItem: sightsActions.fetchItem,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withRouter,
  withStyles(styles),
)(SightEdit);
