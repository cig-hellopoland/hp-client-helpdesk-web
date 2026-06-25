import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _sortedUniq from 'lodash/sortedUniq';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { withRouter } from 'next/router';
import {
  actions as sightsActions,
  selectors as sightsSelectors,
} from '@hello-poland/commons/redux/sights';
import {
  actions as partnersActions,
  selectors as partnersSelectors,
} from 'redux/partners';
import withAuth from 'services/auth/withAuth';
import { CONTENT_LANGUAGES, DEFAULT_LANGUAGE } from 'utils/translations';
import Layout from 'components/Layout';
import ContentTranslation from 'components/ContentTranslation';
import CategoriesForm from 'components/CategoriesForm';
import TagsForm from 'components/TagsForm';
import SightForm from './components/SightForm';
import SightMultimediaForm from './components/SightMultimediaForm';
import SightEvents from './components/SightEvents';

const styles = theme => ({
  dropdown: {
    left: 0,
    maxHeight: 320,
    overflowY: 'auto',
    position: 'absolute',
    right: 0,
    top: '100%',
    zIndex: 10,
  },
  dropdownButton: {
    padding: 4,
  },
  menuItem: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  partnerSelector: {
    position: 'relative',
  },
  root: {
    flex: 1,
    minHeight: '100%',
    padding: theme.spacing.unit * 2,
  },
  section: {
    marginBottom: theme.spacing.unit * 3,
  },
});

const normalizeSearchValue = value => (value || '')
  .toLocaleLowerCase('pl')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const TAB_BY_QUERY_PARAM = {
  offers: 4,
};

class SightEdit extends React.Component {
  baseURL = '/market/sights';

  formikRef = React.createRef();

  state = {
    availableTranslations: CONTENT_LANGUAGES,
    selectedTab: 0,
    selectedTranslation: DEFAULT_LANGUAGE,
    snackbarOpen: false,
    snackbarMessage: '',
    uploadedMultimedia: { images: [], mainImage: {} },
    formChanges: null,
    partnerMenuOpen: false,
    partnerQuery: '',
    selectedPartnerId: '',
  };

  componentDidMount() {
    const {
      itemId, partnerId, clearError, clearItem, error, item, fetchPartners, successMessage, tab,
    } = this.props;

    if (tab && Object.prototype.hasOwnProperty.call(TAB_BY_QUERY_PARAM, tab)) {
      this.setState({ selectedTab: TAB_BY_QUERY_PARAM[tab] });
    }

    if (successMessage) {
      this.handleSnackbarOpen(successMessage);
    }

    if (item) {
      clearItem();
    }

    if (error) {
      clearError();
    }

    if (itemId) {
      this.handleFetchItem(itemId, DEFAULT_LANGUAGE);
    } else if (partnerId) {
      this.setState({ selectedPartnerId: partnerId });
    } else {
      fetchPartners({
        options: {
          headers: {
            'Content-Language': DEFAULT_LANGUAGE,
          },
        },
      });
    }
  }

  getFormValues = (item) => {
    const { itemId } = this.props;
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

    return null;
  };

  getMultimediaFromItem = (item) => {
    const { images, mainImage } = item;
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

    return data;
  };

  setSelectedTab = (event, selectedTab) => {
    const { current } = this.formikRef;
    if (current && current.getFormikBag) {
      const { values } = current.getFormikBag();
      const { images, mainImage, ...rest } = values || {};
      this.setState({ selectedTab, formChanges: rest });
    } else {
      this.setState({ selectedTab });
    }
  };

  clearFormChanges = () => {
    this.setState({ formChanges: null });
  }

  handleFetchItemFailure = () => this.handleRequestFailure();

  handleFetchItemSuccess = () => {
    const { item } = this.props;
    const { availableLanguageVersions, language } = item || {};

    this.setState({
      availableTranslations: availableLanguageVersions,
      selectedTranslation: language || DEFAULT_LANGUAGE,
      uploadedMultimedia: { images: [], mainImage: {} },
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
        onSuccess: () => {
          this.handleFetchItem(itemId, language);
        },
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

  handleSightEventDeleteFailure = message => this.handleSnackbarOpen(message);

  handleSightEventDeleteSuccess = () => {
    const { selectedTranslation } = this.state;
    const { itemId } = this.props;

    this.handleSnackbarOpen('Usunięto ofertę.');
    this.handleFetchItem(itemId, selectedTranslation);
  };

  handleCancel = () => {
    const { returnTo, router } = this.props;

    router.push(returnTo || this.baseURL);
  };

  handleSubmitSuccess = (entity, actions) => {
    const { selectedTranslation } = this.state;
    const { itemId, returnTo, router } = this.props;
    const { resetForm, setSubmitting } = actions;

    setSubmitting(false);

    if (itemId) {
      this.handleFetchItem(itemId, selectedTranslation);
      resetForm();
    } else if (entity && entity.id) {
      if (returnTo) {
        router.push(returnTo);
      } else {
        router.push(
          `${this.baseURL}/edit?itemId=${entity.id}`,
          `${this.baseURL}/${entity.id}/edit`,
        );
      }
    }
  };

  handlePartnerSearchChange = event => this.setState({
    partnerMenuOpen: true,
    partnerQuery: event.target.value,
    selectedPartnerId: '',
  });

  handlePartnerMenuToggle = () => this.setState(state => ({
    partnerMenuOpen: !state.partnerMenuOpen,
  }));

  handlePartnerMenuClose = () => this.setState((state) => {
    const { partners } = this.props;
    const selectedPartner = this.getSortedPartners(partners)
      .find(partner => String(partner.id) === String(state.selectedPartnerId));

    return {
      partnerMenuOpen: false,
      partnerQuery: selectedPartner ? selectedPartner.name : '',
    };
  });

  handlePartnerFocus = (event) => {
    event.target.select();
    this.setState({ partnerMenuOpen: true });
  };

  handlePartnerSelect = partner => this.setState({
    partnerMenuOpen: false,
    partnerQuery: partner ? partner.name : '',
    selectedPartnerId: partner ? partner.id : '',
  });

  getSortedPartners = partners => [...(partners || [])].sort((a, b) => (
    (a.name || '').localeCompare(b.name || '', 'pl', { sensitivity: 'base' })
  ));

  getFilteredPartners = (partners, partnerQuery, selectedPartnerId) => {
    const sortedPartners = this.getSortedPartners(partners);
    const selectedPartner = sortedPartners.find(
      partner => String(partner.id) === String(selectedPartnerId),
    );
    const selectedPartnerName = selectedPartner && selectedPartner.name;
    const query = partnerQuery === selectedPartnerName
      ? ''
      : normalizeSearchValue((partnerQuery || '').trim());

    if (!query) {
      return sortedPartners;
    }

    return sortedPartners.filter(({ name }) => normalizeSearchValue(name).includes(query));
  };

  handlePartnerKeyDown = (event) => {
    if (event.key === 'Escape') {
      this.handlePartnerMenuClose();
      return;
    }

    if (event.key === 'Enter') {
      const { partners } = this.props;
      const { partnerQuery, selectedPartnerId } = this.state;
      const [firstPartner] = this.getFilteredPartners(partners, partnerQuery, selectedPartnerId);

      if (firstPartner) {
        event.preventDefault();
        this.handlePartnerSelect(firstPartner);
      }
    }
  };

  getAggregatedCategoriesFromOffers = (sightEvents = []) => {
    const activeOffers = sightEvents.filter(
      ({ published, blocked }) => published && !blocked,
    );

    const allCategories = activeOffers.flatMap(
      ({ categories = [] }) => categories,
    );

    const uniqueById = Object.values(
      allCategories.reduce((acc, category) => {
        acc[category.id] = category;
        return acc;
      }, {}),
    );

    return uniqueById;
  };

  getAggregatedTagsFromOffers = (events) => {
    if (!Array.isArray(events)) return [];

    const map = new Map();

    events
      .filter(e => e && e.published && !e.blocked)
      .forEach((e) => {
        if (Array.isArray(e.tags)) {
          e.tags.forEach((tag) => {
            if (!map.has(tag.id)) {
              map.set(tag.id, tag);
            }
          });
        }
      });

    return Array.from(map.values());
  };


  render() {
    const {
      availableTranslations, selectedTab, selectedTranslation, snackbarOpen,
      snackbarMessage, uploadedMultimedia, partnerMenuOpen, partnerQuery, selectedPartnerId,
    } = this.state;
    const {
      classes, item, itemId, partnerId: initialPartnerId, partners,
    } = this.props;
    const { defaultLanguage, partnerId: itemPartnerId } = item || {};
    const partnerId = itemPartnerId || initialPartnerId || selectedPartnerId || null;

    const pageTitle = itemId ? 'Edycja obiektów' : 'Nowy obiekt';
    const hasLanguageActions = !!(item && item.id);
    const partnerOptions = this.getFilteredPartners(partners, partnerQuery, selectedPartnerId);

    const multimedia = item
      ? this.getMultimediaFromItem(item)
      : { images: [], mainImage: {} };

    return (
      <Layout>
        <Paper className={classes.root}>
          <Grid container justify="space-between">
            <Grid item>
              <Typography variant="h6">{pageTitle}</Typography>
            </Grid>
            <Grid item>
              <Grid container spacing={16} alignItems="center">
                {!itemId && (
                  <Grid item>
                  <Button color="primary" onClick={this.handleCancel}>
                    Anuluj
                  </Button>
                  </Grid>
                )}
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
            {itemId && <Tab label="Oferty" />}
            {itemId && <Tab label="Komentarze" disabled />}
          </Tabs>
          {!itemId && !initialPartnerId
            && (
              <Grid container spacing={16} className={classes.section}>
                <Grid item xs={12} sm={6} md={4}>
                  <ClickAwayListener onClickAway={this.handlePartnerMenuClose}>
                    <div className={classes.partnerSelector}>
                      <TextField
                        fullWidth
                        label="Partner"
                        onChange={this.handlePartnerSearchChange}
                        onFocus={this.handlePartnerFocus}
                        onKeyDown={this.handlePartnerKeyDown}
                        required
                        value={partnerQuery}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                className={classes.dropdownButton}
                                onClick={this.handlePartnerMenuToggle}
                                aria-label="Rozwiń listę partnerów"
                              >
                                <ArrowDropDownIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {partnerMenuOpen && (
                        <Paper className={classes.dropdown}>
                          {partnerOptions.map(partner => (
                            <MenuItem
                              key={partner.id}
                              className={classes.menuItem}
                              selected={String(partner.id) === String(selectedPartnerId)}
                              onClick={() => this.handlePartnerSelect(partner)}
                            >
                              {partner.name}
                            </MenuItem>
                          ))}
                          {!partnerOptions.length && (
                            <MenuItem className={classes.menuItem} disabled>
                              Brak wyników
                            </MenuItem>
                          )}
                        </Paper>
                      )}
                    </div>
                  </ClickAwayListener>
                </Grid>
              </Grid>
            )
          }
          {selectedTab === 0
            && partnerId
            && (
              <SightForm
                FormikProps={{ ref: this.formikRef }}
                initialValues={this.getFormValues(item)}
                language={selectedTranslation}
                onSubmitSuccess={this.handleSubmitSuccess}
                partnerId={Number(partnerId)}
                uploadedMultimedia={uploadedMultimedia}
                clearFormChanges={this.clearFormChanges}
              />
            )
          }
          {selectedTab === 1
            && (
              <CategoriesForm
                items={this.getAggregatedCategoriesFromOffers(
                  item && item.sightEvents ? item.sightEvents : [],
                )}
                defaultTranslation="__readonly__"
                translation="pl-PL"
              />


            )
          }
          {selectedTab === 2 && (
            <TagsForm
              items={this.getAggregatedTagsFromOffers(
                item && item.sightEvents ? item.sightEvents : [],
              )}
              managePublic={false}
              manageRestricted={false}
              defaultTranslation="__readonly__"
              translation="pl-PL"
            />
          )}
          {selectedTab === 3
            && (
              <SightMultimediaForm
                ImageGalleryProps={{
                  items: uploadedMultimedia.images.length
                    ? uploadedMultimedia.images : multimedia.images || [],
                }}
                MainImageProps={{
                  item: uploadedMultimedia.mainImage.id
                    ? uploadedMultimedia.mainImage : multimedia.mainImage,
                }}
                partnerId={partnerId}
                defaultTranslation={defaultLanguage}
                itemId={itemId}
                onFailure={() => this.handleRequestFailure()}
                onSuccess={data => this.fileActionSuccess(itemId, selectedTranslation, data)}
                translation={selectedTranslation}
              />
            )
          }
          {selectedTab === 4
            && (
              <SightEvents
                items={(item && item.sightEvents) || []}
                onDeleteFailure={this.handleSightEventDeleteFailure}
                onDeleteSuccess={this.handleSightEventDeleteSuccess}
                partnerId={partnerId}
                sightId={itemId}
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
  partnerId: PropTypes.number,
  partners: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  changeDefaultTranslation: PropTypes.func.isRequired,
  classes: PropTypes.shape({}).isRequired,
  clearError: PropTypes.func.isRequired,
  clearItem: PropTypes.func.isRequired,
  deleteTranslation: PropTypes.func.isRequired,
  error: PropTypes.shape({}),
  fetchItem: PropTypes.func.isRequired,
  fetchPartners: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number,
    label: PropTypes.string,
  }),
  returnTo: PropTypes.string,
  router: PropTypes.shape({}).isRequired,
  successMessage: PropTypes.string,
  tab: PropTypes.string,
  updateItem: PropTypes.func.isRequired,
};

SightEdit.defaultProps = {
  itemId: null,
  partnerId: null,
  error: null,
  item: null,
  returnTo: null,
  successMessage: null,
  tab: null,
};

const mapStateToProps = state => ({
  error: sightsSelectors.getError(state),
  item: sightsSelectors.getSight(state),
  partners: partnersSelectors.getList(state),
});

const mapDispatchToProps = {
  changeDefaultTranslation: sightsActions.changeDefaultTranslation,
  clearError: sightsActions.clearError,
  clearItem: sightsActions.clearItem,
  deleteTranslation: sightsActions.deleteTranslation,
  fetchItem: sightsActions.fetchItem,
  fetchPartners: partnersActions.fetchList,
  updateItem: sightsActions.updateItem,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withRouter,
  withStyles(styles),
)(SightEdit);
