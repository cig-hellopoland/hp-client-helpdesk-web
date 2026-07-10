import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _sortedUniq from 'lodash/sortedUniq';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
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
import { selectors as profileSelectors } from 'redux/profile';
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
  createSection: {
    marginTop: theme.spacing.unit * 3,
  },
  createActions: {
    bottom: theme.spacing.unit * 3,
    position: 'fixed',
    right: theme.spacing.unit * 3,
    zIndex: 1200,
  },
});

class SightEventEdit extends React.Component {
  baseURL = '/market/sight-events';

  formikRef = React.createRef();

  state = {
    availableTranslations: CONTENT_LANGUAGES,
    selectedTab: 0,
    selectedTranslation: DEFAULT_LANGUAGE,
    snackbarOpen: false,
    snackbarMessage: '',
    uploadedMultimedia: { images: [], mainImage: {}, pdfAttachment: {} },
    formChanges: null,
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
    const { itemId, sightId } = this.props;
    const { selectedTranslation, formChanges } = this.state;

    if (item && itemId === item.id) {
      const { availableLanguageVersions } = item;
      const hasNewTranslation = availableLanguageVersions
        && !availableLanguageVersions.some(lng => lng === selectedTranslation);

      if (hasNewTranslation) {
        const { label, ...itemProps } = item;

        return { ...itemProps };
      }

      if (formChanges) {
        return { ...item, ...formChanges };
      }

      return { ...item };
    }

    return itemId ? null : { sightId, categories: [], tags: [] };
  };

  getMultimediaFromItem = (item) => {
    const { images, mainImage, pdfAttachment } = item;
    const data = {};

    if (mainImage) {
      const { id, ...downloadUrl } = mainImage;

      data.mainImage = {
        id,
        name: 'Zdjęcie promocyjne',
        type: 'image/jpeg',
        downloadUrl,
      };
    }

    if (Array.isArray(images)) {
      data.images = images.map((image) => {
        const { id, ...downloadUrl } = image;
        return {
          id,
          name: `Zdjęcie galerii (id #${id})`,
          type: 'image/jpeg',
          downloadUrl,
        };
      });
    }

    if (pdfAttachment) {
      data.pdfAttachment = {
        ...pdfAttachment,
        type: 'PDF',
      };
    }

    return data;
  }

  setSelectedTab = (event, selectedTab) => {
    const { current } = this.formikRef;
    if (current && current.getFormikBag) {
      const { values } = current.getFormikBag();
      const {
        images, mainImage, pdfAttachment, ...rest
      } = values || {};
      this.setState({ selectedTab, formChanges: rest });
    } else {
      this.setState({ selectedTab });
    }
  };

  clearFormChanges = () => {
    this.setState({ formChanges: null });
  }

  getFormikBagSafe = () => {
    const { current } = this.formikRef;

    if (current && current.getFormikBag) {
      return current.getFormikBag();
    }

    return null;
  };

  getFormikValues = () => {
    const bag = this.getFormikBagSafe();

    return bag ? bag.values : null;
  };

  handleSubmitClick = () => {
    const { current } = this.formikRef;

    if (current && current.submitForm) {
      current.submitForm();
    }
  };

  handleCancel = () => {
    const { returnTo, router } = this.props;

    router.push(returnTo || this.baseURL);
  };

  handleSubmitFailure = (actions, errorResponse) => {
    const { clearError, error } = this.props;
    const sourceError = errorResponse || error || {};
    const { data: errorData } = sourceError || {};
    const message = (errorData && errorData.message)
      || (sourceError && sourceError.message)
      || 'Nie udało się zapisać oferty.';

    this.handleSnackbarOpen(message);

    if (clearError) {
      clearError();
    }
  };

  handleLocalItemDataTypeSubmit = dataType => (dataTypeId) => {
    const { categoriesList, tagsList } = this.props;
    const bag = this.getFormikBagSafe();

    if (!bag) {
      return;
    }

    const field = dataType === ITEM_DATA_TYPES.CATEGORY ? 'categories' : 'tags';
    const sourceList = dataType === ITEM_DATA_TYPES.CATEGORY
      ? categoriesList
      : tagsList;
    const current = Array.isArray(bag.values[field]) ? bag.values[field] : [];
    const selectedItem = sourceList.find(({ id }) => id === dataTypeId);

    if (selectedItem && !current.some(({ id }) => id === dataTypeId)) {
      bag.setFieldValue(field, [...current, selectedItem], false);
      this.forceUpdate();
    }
  };

  handleLocalItemDataTypeDelete = dataType => (dataTypeId) => {
    const bag = this.getFormikBagSafe();

    if (!bag) {
      return;
    }

    const field = dataType === ITEM_DATA_TYPES.CATEGORY ? 'categories' : 'tags';
    const current = Array.isArray(bag.values[field]) ? bag.values[field] : [];

    bag.setFieldValue(field, current.filter(({ id }) => id !== dataTypeId), false);
    this.forceUpdate();
  };

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
      uploadedMultimedia: { images: [], mainImage: {}, pdfAttachment: {} },
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

  fileActionSuccess = (itemId, language, data) => {
    const { updateItem, item } = this.props;
    this.setState(state => ({ uploadedMultimedia: { ...state.uploadedMultimedia, ...data } }));
    if (itemId && data) {
      updateItem({
        id: itemId,
        data: {
          ...item,
          ...data,
        },
        onSuccess: () => this.handleFetchItem(itemId, language),
        pathParams: {
          languageVersion: language,
        },
        options: {
          headers: {
            'Content-Language': language,
          },
        },
      });
    } else if (itemId && !data) {
      this.handleFetchItem(itemId, language);
    }
  }

  handleSnackbarOpen = message => this.setState({
    snackbarOpen: true,
    snackbarMessage: typeof message === 'string' ? message : 'Wystąpił nieznany błąd.',
  });

  handleSnackbarClose = () => this.setState({
    snackbarOpen: false,
    snackbarMessage: '',
  });

  handleSubmitSuccess = (entity, actions) => {
    const { selectedTranslation } = this.state;
    const {
      itemId, returnTo, router, updateItemCategory, updateItemTag,
    } = this.props;
    const { resetForm, setSubmitting } = actions;

    setSubmitting(false);

    if (itemId) {
      this.handleFetchItem(itemId, selectedTranslation);
      resetForm();
    } else if (entity && entity.id) {
      const values = this.getFormikValues() || {};
      const { categories = [], tags = [] } = values;
      const assignments = [
        ...categories.map(({ id: categoryId }) => new Promise(resolve => updateItemCategory({
          id: entity.id,
          categoryId,
          onFailure: resolve,
          onSuccess: resolve,
        }))),
        ...tags.map(({ id: tagId }) => new Promise(resolve => updateItemTag({
          id: entity.id,
          tagId,
          onFailure: resolve,
          onSuccess: resolve,
        }))),
      ];

      Promise.all(assignments).then(() => {
        if (returnTo) {
          router.push(returnTo);
        } else {
          router.push(
            `${this.baseURL}/edit?itemId=${entity.id}`,
            `${this.baseURL}/${entity.id}/edit`,
          );
        }
      });
    }
  };

  handleTPDCreate = (data, onSuccess) => {
    const { selectedTranslation } = this.state;
    const { createTicketPoolDefinition, itemId } = this.props;

    createTicketPoolDefinition({
      data,
      onFailure: this.handleTPDError,
      onSuccess: () => {
        this.handleFetchItem(itemId, selectedTranslation);
        if (onSuccess) {
          onSuccess();
        }
      },
    });
  };

  handleTPDDelete = (poolId) => {
    const { selectedTranslation } = this.state;
    const { deleteTicketPoolDefinition, item, itemId } = this.props;

    if (poolId) {
      deleteTicketPoolDefinition({
        id: poolId,
        options: {
          params: {
            partnerId: item.partnerId,
          },
        },
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
      availableTranslations, selectedTab, selectedTranslation, snackbarOpen,
      snackbarMessage, uploadedMultimedia,
    } = this.state;
    const {
      categoriesList, classes, item, itemId, partnerId: initialPartnerId, tagsList, profile,
    } = this.props;
    const { defaultLanguage, partnerId: itemPartnerId } = item || {};
    const partnerId = itemPartnerId || initialPartnerId || null;
    const formikValues = this.getFormikValues();
    const selectedCategories = (formikValues && formikValues.categories)
      || (item && item.categories)
      || [];
    const selectedTags = (formikValues && formikValues.tags)
      || (item && item.tags)
      || [];

    const pageTitle = itemId ? 'Edycja oferty' : 'Nowa oferta';
    const hasLanguageActions = !!(item && item.id);
    const roles = (profile && profile.roles) || [];
    const canEditOfferContent = [
      'ADMIN',
      'ROOT',
      'SALESMAN',
      'HELPDESK_PARTNER_MANAGER',
      'HELPDESK_CONTENT_MANAGER',
    ].some(role => roles.includes(role));
    const canEditTicketPools = roles.includes('ADMIN') || roles.includes('SALESMAN');

    const multimedia = item
      ? this.getMultimediaFromItem(item)
      : { images: [], mainImage: {}, pdfAttachment: {} };

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
            {itemId && <Tab label="Kategorie" />}
            {itemId && <Tab label="Tagi" />}
            {itemId && <Tab label="Multimedia" />}
            {itemId && <Tab label="Pule produktów" />}
            {itemId && <Tab label="Komentarze" disabled />}
          </Tabs>
          {selectedTab === 0
            && (
              <SightEventForm
                FormikProps={{ ref: this.formikRef }}
                initialValues={this.getFormValues(item)}
                language={selectedTranslation}
                onSubmitFailure={this.handleSubmitFailure}
                onSubmitSuccess={this.handleSubmitSuccess}
                uploadedMultimedia={uploadedMultimedia}
                clearFormChanges={this.clearFormChanges}
                hideButtons={!itemId}
                hideErrors={!itemId}
              />
            )
          }
          {selectedTab === 0 && !itemId
            && (
              <React.Fragment>
                <div className={classes.createSection}>
                  <CategoriesForm
                    categories={categoriesList}
                    defaultTranslation={DEFAULT_LANGUAGE}
                    items={selectedCategories}
                    managePublic={canEditOfferContent}
                    manageRestricted={canEditOfferContent}
                    onSubmit={canEditOfferContent
                      ? this.handleLocalItemDataTypeSubmit(ITEM_DATA_TYPES.CATEGORY)
                      : null}
                    onDelete={canEditOfferContent
                      ? this.handleLocalItemDataTypeDelete(ITEM_DATA_TYPES.CATEGORY)
                      : null}
                    translation={selectedTranslation}
                  />
                </div>
                <div className={classes.createSection}>
                  <TagsForm
                    tags={tagsList}
                    defaultTranslation={DEFAULT_LANGUAGE}
                    items={selectedTags}
                    managePublic={canEditOfferContent}
                    manageRestricted={canEditOfferContent}
                    onSubmit={canEditOfferContent
                      ? this.handleLocalItemDataTypeSubmit(ITEM_DATA_TYPES.TAG)
                      : null}
                    onDelete={canEditOfferContent
                      ? this.handleLocalItemDataTypeDelete(ITEM_DATA_TYPES.TAG)
                      : null}
                    translation={selectedTranslation}
                  />
                </div>
                <div className={classes.createSection}>
                  <SightEventMultimediaForm
                    AttachmentProps={{
                      item: uploadedMultimedia.pdfAttachment.id
                        ? uploadedMultimedia.pdfAttachment : multimedia.pdfAttachment,
                    }}
                    ImageGalleryProps={{
                      items: uploadedMultimedia.images.length
                        ? uploadedMultimedia.images : multimedia.images || [],
                    }}
                    MainImageProps={{
                      item: uploadedMultimedia.mainImage.id
                        ? uploadedMultimedia.mainImage : multimedia.mainImage,
                    }}
                    defaultTranslation={DEFAULT_LANGUAGE}
                    itemId={itemId}
                    partnerId={partnerId}
                    onFailure={() => this.handleRequestFailure()}
                    onSuccess={data => this.fileActionSuccess(itemId, selectedTranslation, data)}
                    translation={selectedTranslation}
                  />
                </div>
                <Grid container spacing={16} justify="flex-end" className={classes.createActions}>
                  <Grid item>
                    <Button color="primary" onClick={this.handleCancel}>
                      Anuluj
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="primary" onClick={this.handleSubmitClick}>
                      Zapisz
                    </Button>
                  </Grid>
                </Grid>
              </React.Fragment>
            )
          }
          {selectedTab === 1
            && (
              <CategoriesForm
                categories={categoriesList}
                defaultTranslation={defaultLanguage}
                items={item.categories}
                managePublic={canEditOfferContent}
                manageRestricted={canEditOfferContent}
                onSubmit={canEditOfferContent
                  ? this.handleItemDataTypeSubmit(ITEM_DATA_TYPES.CATEGORY)
                  : null}
                onDelete={canEditOfferContent
                  ? this.handleItemDataTypeDelete(ITEM_DATA_TYPES.CATEGORY)
                  : null}
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
                managePublic={canEditOfferContent}
                manageRestricted={canEditOfferContent}
                onSubmit={canEditOfferContent
                  ? this.handleItemDataTypeSubmit(ITEM_DATA_TYPES.TAG)
                  : null}
                onDelete={canEditOfferContent
                  ? this.handleItemDataTypeDelete(ITEM_DATA_TYPES.TAG)
                  : null}
                translation={selectedTranslation}
              />
            )
          }
          {selectedTab === 3
            && (
              <SightEventMultimediaForm
                AttachmentProps={{
                  item: uploadedMultimedia.pdfAttachment.id
                    ? uploadedMultimedia.pdfAttachment : multimedia.pdfAttachment,
                }}
                ImageGalleryProps={{
                  items: uploadedMultimedia.images.length
                    ? uploadedMultimedia.images : multimedia.images || [],
                }}
                MainImageProps={{
                  item: uploadedMultimedia.mainImage.id
                    ? uploadedMultimedia.mainImage : multimedia.mainImage,
                }}
                defaultTranslation={defaultLanguage}
                itemId={itemId}
                partnerId={partnerId}
                onFailure={() => this.handleRequestFailure()}
                onSuccess={data => this.fileActionSuccess(itemId, selectedTranslation, data)}
                translation={selectedTranslation}
              />
            )
          }
          {selectedTab === 4
            && (
              <TicketPoolDefinitionsList
                data={item.ticketPoolDefinitions}
                partnerId={partnerId}
                sightEventId={itemId}
                onTPDCreate={this.handleTPDCreate}
                onTPDDelete={this.handleTPDDelete}
                onTPDUpdate={this.handleTPDUpdate}
                canEdit={canEditTicketPools}
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
  partnerId: PropTypes.number,
  sightId: PropTypes.number,
  changeDefaultTranslation: PropTypes.func.isRequired,
  classes: PropTypes.shape({}).isRequired,
  clearError: PropTypes.func.isRequired,
  clearItem: PropTypes.func.isRequired,
  createTicketPoolDefinition: PropTypes.func.isRequired,
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
  returnTo: PropTypes.string,
  router: PropTypes.shape({}).isRequired,
  tagsList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  updateItem: PropTypes.func.isRequired,
  updateItemCategory: PropTypes.func.isRequired,
  updateItemTag: PropTypes.func.isRequired,
  updateTicketPoolDefinition: PropTypes.func.isRequired,
  profile: PropTypes.shape({}),
};

SightEventEdit.defaultProps = {
  itemId: null,
  partnerId: null,
  sightId: null,
  error: null,
  errorTPD: null,
  item: null,
  profile: null,
  returnTo: null,
};

const mapStateToProps = state => ({
  categoriesList: categoriesSelectors.getList(state),
  error: sightEventsSelectors.getError(state),
  errorTPD: ticketPoolDefinitionSelectors.getError(state),
  item: sightEventsSelectors.getSightEvent(state),
  tagsList: tagsSelectors.getList(state),
  profile: profileSelectors.getProfile(state),
});

const mapDispatchToProps = {
  changeDefaultTranslation: sightEventsActions.changeDefaultTranslation,
  clearError: sightEventsActions.clearError,
  clearItem: sightEventsActions.clearItem,
  createTicketPoolDefinition: ticketPoolDefinitionActions.createItem,
  deleteItemCategory: sightEventsActions.deleteItemCategory,
  deleteItemTag: sightEventsActions.deleteItemTag,
  deleteTicketPoolDefinition: ticketPoolDefinitionActions.deleteItem,
  deleteTranslation: sightEventsActions.deleteTranslation,
  fetchCategoriesList: categoriesActions.fetchList,
  fetchTagsList: tagsActions.fetchList,
  fetchItem: sightEventsActions.fetchItem,
  updateItem: sightEventsActions.updateItem,
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
