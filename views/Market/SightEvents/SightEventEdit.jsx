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
  actions as categoriesActions,
  selectors as categoriesSelectors,
} from '@hello-poland/commons/redux/categories';
import {
  actions as tagsActions,
  selectors as tagsSelectors,
} from '@hello-poland/commons/redux/tags';
import {
  actions as sightEventsActions,
  selectors as sightEventsSelectors,
} from '@hello-poland/commons/redux/sightEvents';
import {
  actions as ticketPoolDefinitionActions,
  selectors as ticketPoolDefinitionSelectors,
} from '@hello-poland/commons/redux/ticketPoolDefinitions';
import withAuth from 'services/auth/withAuth';
import { CONTENT_LANGUAGES, DEFAULT_LANGUAGE } from 'utils/translations';
import Layout from 'components/Layout';
import ContentTranslation from 'components/ContentTranslation';
import CategoriesForm from 'components/CategoriesForm';
import TagsForm from 'components/TagsForm';
import SightEventForm from './components/SightEventForm';
import SightEventMultimediaForm from './components/SightEventMultimediaForm';
import TicketPoolDefinitionsList from './components/TicketPoolDefinitionsList';

const ITEM_DATA_TYPES = {
  CATEGORY: 'CATEGORY',
  TAG: 'TAG',
};

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

class SightEventEdit extends React.Component {
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

    this.handleFetchCategoriesList(DEFAULT_LANGUAGE);
    this.handleFetchTagsList(DEFAULT_LANGUAGE);
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
    const { images, mainImage, pdfAttachment } = item;
    const data = {};

    if (mainImage) {
      const { id, ...downloadUrl } = mainImage;

      data.mainImage = {
        createdBy: '',
        createdDate: '',
        id,
        modifiedBy: '',
        modifiedDate: '',
        name: 'Zdjęcie promocyjne',
        path: '/home/hpl/var/DMS/omg/1234.jpg',
        size: 12345,
        type: 'image/jpeg',
        downloadUrl,
      };
    }

    if (Array.isArray(images)) {
      data.images = images.map((image) => {
        const { id, ...downloadUrl } = image;
        return {
          createdBy: '',
          createdDate: '',
          id,
          modifiedBy: '',
          modifiedDate: '',
          name: `Zdjęcie galerii (id #${id})`,
          path: '/home/hpl/var/DMS/omg/1234.jpg',
          size: 12345,
          type: 'image/jpeg',
          downloadUrl,
        };
      });
    }

    if (pdfAttachment) {
      data.attachments = [
        {
          ...pdfAttachment,
          createdBy: '',
          createdDate: '',
          modifiedBy: '',
          modifiedDate: '',
          size: 12345,
          type: 'application/pdf',
        },
      ];
    }

    return data;
  };

  setSelectedTab = (event, selectedTab) => this.setState({ selectedTab });

  handleItemDataTypeDeleteFailure = () => this.handleRequestFailure();

  handleItemDataTypeDeleteSuccess = () => {
    const { itemId } = this.props;
    const { selectedTranslation } = this.state;

    this.handleFetchItem(itemId, selectedTranslation);
  };

  handleItemDataTypeDelete = dataType => (dataTypeId) => {
    const { itemId, deleteItemCategory, deleteItemTag } = this.props;
    let action = () => {};
    const options = {};

    if (dataType === ITEM_DATA_TYPES.CATEGORY) {
      action = deleteItemCategory;
      options.categoryId = dataTypeId;
    } else if (dataType === ITEM_DATA_TYPES.TAG) {
      action = deleteItemTag;
      options.tagId = dataTypeId;
    }

    action({
      id: itemId,
      ...options,
      onFailure: this.handleItemDataTypeDeleteFailure,
      onSuccess: this.handleItemDataTypeDeleteSuccess,
    });
  };

  hhandleItemDataTypeSubmitFailure = () => this.handleRequestFailure();

  handleItemDataTypeSubmitSuccess = () => {
    const { itemId } = this.props;
    const { selectedTranslation } = this.state;

    this.handleFetchItem(itemId, selectedTranslation);
  };

  handleItemDataTypeSubmit = dataType => (dataTypeId) => {
    const { itemId, updateItemCategory, updateItemTag } = this.props;
    let action = () => {};
    const options = {};

    if (dataType === ITEM_DATA_TYPES.CATEGORY) {
      action = updateItemCategory;
      options.categoryId = dataTypeId;
    } else if (dataType === ITEM_DATA_TYPES.TAG) {
      action = updateItemTag;
      options.tagId = dataTypeId;
    }

    if (action) {
      action({
        id: itemId,
        ...options,
        onFailure: this.hhandleItemDataTypeSubmitFailure,
        onSuccess: this.handleItemDataTypeSubmitSuccess,
      });
    }
  };

  handleFetchCategoriesList = (language) => {
    const { fetchCategoriesList } = this.props;

    fetchCategoriesList({
      options: {
        headers: {
          'Content-Language': language,
        },
      },
    });
  };

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

  handleFetchTagsList = (language) => {
    const { fetchTagsList } = this.props;

    fetchTagsList({
      options: {
        headers: {
          'Content-Language': language,
        },
      },
    });
  };

  handleRequestFailure = () => {
    const { clearError, error } = this.props;

    if (error) {
      this.handleSnackbarOpen(error && error.message);

      if (clearError) {
        clearError();
      }
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

  handleSubmitSuccess = (entityId, actions) => {
    const { selectedTranslation } = this.state;
    const { itemId } = this.props;
    const { resetForm, setSubmitting } = actions;

    this.handleFetchItem(itemId, selectedTranslation);

    setSubmitting(false);
    resetForm();
  };

  handleTPDDelete = (poolId) => {
    const { selectedTranslation } = this.state;
    const { deleteTicketPoolDefinition, itemId } = this.props;

    if (poolId) {
      deleteTicketPoolDefinition({
        id: poolId,
        onFailure: this.handleTPDError,
        onSuccess: () => this.handleFetchItem(itemId, selectedTranslation),
      });
    }
  };

  handleTPDUpdate = (data) => {
    const { selectedTranslation } = this.state;
    const { updateTicketPoolDefinition, itemId } = this.props;

    if (data) {
      const { id } = data;

      updateTicketPoolDefinition({
        id,
        data,
        onFailure: this.handleTPDError,
        onSuccess: () => this.handleFetchItem(itemId, selectedTranslation),
      });
    }
  };

  handleTPDError = () => {
    const { errorTPD } = this.props;
    const { data: errorData } = errorTPD || {};

    this.handleSnackbarOpen(errorData.message || 'Wystąpił błąd podczas edycji puli produktów');
  };

  render() {
    const {
      availableTranslations, selectedTab, selectedTranslation, snackbarOpen, snackbarMessage,
    } = this.state;
    const {
      categoriesList, classes, item, itemId, tagsList,
    } = this.props;
    const { defaultLanguage, partnerId } = item || {};

    const pageTitle = itemId ? 'Edycja oferty' : 'Nowa oferta';
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
            <Tab label="Tagi" />
            <Tab label="Multimedia" />
            <Tab label="Pule produktów" />
            <Tab label="Komentarze" disabled />
          </Tabs>
          {selectedTab === 0
            && (
              <SightEventForm
                initialValues={this.getFormValues(item)}
                language={selectedTranslation}
                onSubmitSuccess={this.handleSubmitSuccess}
              />
            )
          }
          {selectedTab === 1
            && (
              <CategoriesForm
                categories={categoriesList}
                defaultTranslation={defaultLanguage}
                items={item.categories}
                managePublic
                manageRestricted
                onSubmit={this.handleItemDataTypeSubmit(ITEM_DATA_TYPES.CATEGORY)}
                onDelete={this.handleItemDataTypeDelete(ITEM_DATA_TYPES.CATEGORY)}
                translation={selectedTranslation}
              />
            )
          }
          {selectedTab === 2
            && (
              <TagsForm
                tags={tagsList}
                defaultTranslation={defaultLanguage}
                items={item.tags}
                managePublic
                manageRestricted
                onSubmit={this.handleItemDataTypeSubmit(ITEM_DATA_TYPES.TAG)}
                onDelete={this.handleItemDataTypeDelete(ITEM_DATA_TYPES.TAG)}
                translation={selectedTranslation}
              />
            )
          }
          {selectedTab === 3
            && (
              <SightEventMultimediaForm
                data={this.getMultimediaFromItem(item)}
                defaultTranslation={defaultLanguage}
                itemId={itemId}
                onFailure={() => this.handleRequestFailure()}
                onSuccess={() => this.handleFetchItem(itemId, selectedTranslation)}
                translation={selectedTranslation}
              />
            )
          }
          {selectedTab === 4
            && (
              <TicketPoolDefinitionsList
                data={item.ticketPoolDefinitions}
                partnerId={partnerId}
                onTPDDelete={this.handleTPDDelete}
                onTPDUpdate={this.handleTPDUpdate}
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

SightEventEdit.propTypes = {
  categoriesList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  itemId: PropTypes.number,
  changeDefaultTranslation: PropTypes.func.isRequired,
  classes: PropTypes.shape({}).isRequired,
  clearError: PropTypes.func.isRequired,
  clearItem: PropTypes.func.isRequired,
  deleteItemCategory: PropTypes.func.isRequired,
  deleteItemTag: PropTypes.func.isRequired,
  deleteTicketPoolDefinition: PropTypes.func.isRequired,
  deleteTranslation: PropTypes.func.isRequired,
  error: PropTypes.shape({}),
  errorTPD: PropTypes.shape({}),
  fetchCategoriesList: PropTypes.func.isRequired,
  fetchItem: PropTypes.func.isRequired,
  fetchTagsList: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number,
    label: PropTypes.string,
  }),
  router: PropTypes.shape({}).isRequired,
  tagsList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  updateItemCategory: PropTypes.func.isRequired,
  updateItemTag: PropTypes.func.isRequired,
  updateTicketPoolDefinition: PropTypes.func.isRequired,
};

SightEventEdit.defaultProps = {
  itemId: null,
  error: null,
  errorTPD: null,
  item: null,
};

const mapStateToProps = state => ({
  categoriesList: categoriesSelectors.getList(state),
  error: sightEventsSelectors.getError(state),
  errorTPD: ticketPoolDefinitionSelectors.getError(state),
  item: sightEventsSelectors.getSightEvent(state),
  tagsList: tagsSelectors.getList(state),
});

const mapDispatchToProps = {
  changeDefaultTranslation: sightEventsActions.changeDefaultTranslation,
  clearError: sightEventsActions.clearError,
  clearItem: sightEventsActions.clearItem,
  deleteItemCategory: sightEventsActions.deleteItemCategory,
  deleteItemTag: sightEventsActions.deleteItemTag,
  deleteTicketPoolDefinition: ticketPoolDefinitionActions.deleteItem,
  deleteTranslation: sightEventsActions.deleteTranslation,
  fetchCategoriesList: categoriesActions.fetchList,
  fetchTagsList: tagsActions.fetchList,
  fetchItem: sightEventsActions.fetchItem,
  updateItemCategory: sightEventsActions.updateItemCategory,
  updateItemTag: sightEventsActions.updateItemTag,
  updateTicketPoolDefinition: ticketPoolDefinitionActions.updateItem,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withRouter,
  withStyles(styles),
)(SightEventEdit);
