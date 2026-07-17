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
  actions as partnersActions,
  selectors as partnersSelectors,
} from 'redux/partners';
import {
  actions as usersActions,
  selectors as usersSelectors,
} from 'redux/users';
import {
  actions as sightsActions,
  selectors as sightsSelectors,
} from '@hello-poland/commons/redux/sights';
import withAuth from 'services/auth/withAuth';
import { CONTENT_LANGUAGES, DEFAULT_LANGUAGE } from 'utils/translations';
import Layout from 'components/Layout';
import ContentTranslation from 'components/ContentTranslation';
import PartnerMarketForm from './components/PartnerMarketForm';
import PartnerCompanyForm from './components/PartnerCompanyForm';
import PartnerMultimediaForm from './components/PartnerMultimediaForm';
import PartnerUsersList from './components/PartnerUsersList';
import TicketsListView from './components/TicketsListView';
import SightsList from '../Sights/SightsList';

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

const TAB_BY_QUERY_PARAM = {
  objects: 3,
};

class PartnersEdit extends React.Component {
  baseURL = '/market/partners';

  state = {
    availableTranslations: CONTENT_LANGUAGES,
    selectedTab: 0,
    selectedTranslation: DEFAULT_LANGUAGE,
    snackbarOpen: false,
    snackbarMessage: '',
  };

  componentDidMount() {
    const {
      itemId, clearError, clearItem, error, item, successMessage, tab,
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
    const { mainImage } = item;
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

  handlePasswordChange = (userId, password, callbacks = {}) => {
    const { changePartnerUserPassword, itemId } = this.props;

    if (changePartnerUserPassword) {
      changePartnerUserPassword({
        partnerId: itemId,
        id: userId,
        data: {
          password,
        },
        onFailure: () => {
          const { clearUsersError, errorUsers } = this.props;
          const { message } = errorUsers || {};

          this.handleSnackbarOpen(message || 'Wystąpił błąd podczas zmiany hasła użytkownika');

          if (clearUsersError) {
            clearUsersError();
          }

          if (callbacks.onFailure) {
            callbacks.onFailure();
          }
        },
        onSuccess: callbacks.onSuccess,
      });
    }
  };

  handleUsherPasswordChange = (usherId, password, callbacks = {}) => {
    const { changePartnerUsherPassword, itemId } = this.props;

    if (changePartnerUsherPassword) {
      changePartnerUsherPassword({
        partnerId: itemId,
        id: usherId,
        data: {
          password,
        },
        onFailure: () => {
          const { clearUsersError, errorUsers } = this.props;
          const { message } = errorUsers || {};

          this.handleSnackbarOpen(message || 'WystÄ…piĹ‚ bĹ‚Ä…d podczas zmiany hasĹ‚a biletera');

          if (clearUsersError) {
            clearUsersError();
          }

          if (callbacks.onFailure) {
            callbacks.onFailure();
          }
        },
        onSuccess: callbacks.onSuccess,
      });
    }
  };

  handleDeleteUserFailure = () => {
    const { clearUsersError, errorUsers } = this.props;
    const { message } = errorUsers || {};

    this.handleSnackbarOpen(message || 'Wystąpił błąd podczas usuwania użytkownika');

    if (clearUsersError) {
      clearUsersError();
    }
  };

  handleDeleteUserSuccess = (callback) => {
    const { itemId } = this.props;
    const { selectedTranslation } = this.state;

    this.handleSnackbarOpen('Użytkownik został usunięty');

    if (itemId) {
      this.handleFetchItem(itemId, selectedTranslation);
    }

    if (callback) {
      callback();
    }
  };

  handleDeleteUser = (userId, callbacks = {}) => {
    const { deletePartnerUser, itemId } = this.props;

    if (deletePartnerUser) {
      deletePartnerUser({
        partnerId: itemId,
        id: userId,
        onFailure: () => {
          this.handleDeleteUserFailure();

          if (callbacks.onFailure) {
            callbacks.onFailure();
          }
        },
        onSuccess: () => this.handleDeleteUserSuccess(callbacks.onSuccess),
      });
    }
  };

  handleSetPartnerUserBlocked = (userId, blocked, callbacks = {}) => {
    const { itemId, setPartnerUserBlocked } = this.props;

    setPartnerUserBlocked({
      partnerId: itemId,
      id: userId,
      blocked,
      onFailure: callbacks.onFailure,
      onSuccess: callbacks.onSuccess,
    });
  };

  handleSetPartnerUsherBlocked = (usherId, blocked, callbacks = {}) => {
    const { itemId, setPartnerUsherBlocked } = this.props;

    setPartnerUsherBlocked({
      partnerId: itemId,
      id: usherId,
      blocked,
      onFailure: callbacks.onFailure,
      onSuccess: callbacks.onSuccess,
    });
  };

  handleDeleteUsher = (usherId, callbacks = {}) => {
    const { deletePartnerUsher, itemId } = this.props;

    if (deletePartnerUsher) {
      deletePartnerUsher({
        partnerId: itemId,
        id: usherId,
        onFailure: () => {
          this.handleDeleteUserFailure();

          if (callbacks.onFailure) {
            callbacks.onFailure();
          }
        },
        onSuccess: callbacks.onSuccess,
      });
    }
  };

  handleCreatePartnerUser = (request) => {
    const { createPartnerUser } = this.props;

    createPartnerUser(request);
  };

  handleUpdatePartnerUser = (request) => {
    const { updatePartnerUser } = this.props;

    updatePartnerUser(request);
  };

  handleCreatePartnerUsher = (request) => {
    const { createPartnerUsher } = this.props;

    createPartnerUsher(request);
  };

  handleUpdatePartnerUsher = (request) => {
    const { updatePartnerUsher } = this.props;

    updatePartnerUsher(request);
  };

  handleFetchPartnerUsers = (partnerId) => {
    const { fetchPartnerUsers } = this.props;

    fetchPartnerUsers({ partnerId });
  };

  handleFetchPartnerUshers = (partnerId) => {
    const { fetchPartnerUshers } = this.props;

    fetchPartnerUshers({ partnerId });
  };

  handleFetchSights = (partnerId) => {
    const { fetchSights } = this.props;

    fetchSights({
      options: {
        headers: {
          'Content-Language': DEFAULT_LANGUAGE,
        },
        params: {
          partnerId,
        },
      },
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

  handleEmailResetFailure = () => {
    const { clearUsersError } = this.props;

    this.handleSnackbarOpen('Nie udało się zmienić hasła użytkownika Partnera.');

    if (clearUsersError) {
      clearUsersError();
    }
  }

  handleEmailResetSuccess = () => {
    const { itemId } = this.props;
    const { selectedTranslation } = this.state;

    if (itemId) {
      this.handleFetchItem(itemId, selectedTranslation);
    }
  }

  handleEmailReset = ({
    email, partnerId, onFailure, onSuccess,
  }) => {
    const { resetEmail } = this.props;

    resetEmail({
      id: partnerId,
      data: { email },
      onFailure: () => {
        this.handleEmailResetFailure();
        if (onFailure) {
          onFailure();
        }
      },
      onSuccess: () => {
        this.handleEmailResetSuccess();
        if (onSuccess) {
          onSuccess();
        }
      },
    });
  }

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

  render() {
    const {
      availableTranslations, selectedTab, selectedTranslation, snackbarOpen, snackbarMessage,
    } = this.state;
    const {
      classes, errorUsers, item, itemId, partnerUsers, partnerUshers, sights,
    } = this.props;
    const { defaultLanguage } = item || {};

    const pageTitle = 'Edycja partnera';
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
            <Tab label="Dane firmy" />
            <Tab label="Wizytówka" />
            <Tab label="Multimedia" />
            <Tab label="Obiekty" />
            <Tab label="Definicje produktów" />
            <Tab label="Użytkownicy" />
            <Tab label="Komentarze" disabled />
          </Tabs>
          {selectedTab === 0
            && (
              <PartnerCompanyForm
                disabled={selectedTranslation !== defaultLanguage}
                hideButtons={selectedTranslation !== defaultLanguage}
                isEditMode
                initialValues={this.getFormValues(item)}
                language={selectedTranslation}
                onSubmitSuccess={this.handleSubmitSuccess}
                onResetEmailSuccess={this.handleEmailReset}
              />
            )
          }
          {selectedTab === 1
            && (
              <PartnerMarketForm
                initialValues={this.getFormValues(item)}
                language={selectedTranslation}
                onSubmitSuccess={this.handleSubmitSuccess}
              />
            )
          }
          {selectedTab === 2
            && (
              <PartnerMultimediaForm
                data={this.getMultimediaFromItem(item)}
                defaultTranslation={defaultLanguage}
                itemId={itemId}
                onFailure={() => this.handleRequestFailure()}
                onSuccess={() => this.handleFetchItem(itemId, selectedTranslation)}
                translation={selectedTranslation}
              />
            )
          }
          {selectedTab === 3
            && (
              <SightsList
                embedded
                partnerId={itemId}
                showPartner={false}
              />
            )
          }
          {selectedTab === 4
            && (
              <TicketsListView
                defaultTranslation={defaultLanguage}
                partnerId={itemId}
                translation={selectedTranslation}
              />
            )
          }
          {selectedTab === 5
            && (
              <PartnerUsersList
                error={errorUsers}
                items={partnerUsers}
                partnerId={itemId}
                ushers={partnerUshers}
                sights={sights}
                onCreateUsher={this.handleCreatePartnerUsher}
                onCreateUser={this.handleCreatePartnerUser}
                onFetchItems={() => this.handleFetchPartnerUsers(itemId)}
                onFetchUshers={() => this.handleFetchPartnerUshers(itemId)}
                onFetchSights={this.handleFetchSights}
                onUsherPasswordChange={this.handleUsherPasswordChange}
                onDeleteUsher={this.handleDeleteUsher}
                onPasswordChange={this.handlePasswordChange}
                onDeleteItem={this.handleDeleteUser}
                onSetUserBlocked={this.handleSetPartnerUserBlocked}
                onSetUsherBlocked={this.handleSetPartnerUsherBlocked}
                onUpdateUsher={this.handleUpdatePartnerUsher}
                onUpdateUser={this.handleUpdatePartnerUser}
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

PartnersEdit.propTypes = {
  itemId: PropTypes.number,
  changeDefaultTranslation: PropTypes.func.isRequired,
  changePartnerUsherPassword: PropTypes.func.isRequired,
  changePartnerUserPassword: PropTypes.func.isRequired,
  classes: PropTypes.shape({}).isRequired,
  clearError: PropTypes.func.isRequired,
  clearUsersError: PropTypes.func.isRequired,
  clearItem: PropTypes.func.isRequired,
  createPartnerUsher: PropTypes.func.isRequired,
  createPartnerUser: PropTypes.func.isRequired,
  deleteTranslation: PropTypes.func.isRequired,
  deletePartnerUsher: PropTypes.func.isRequired,
  deletePartnerUser: PropTypes.func.isRequired,
  error: PropTypes.shape({}),
  errorUsers: PropTypes.shape({}),
  fetchItem: PropTypes.func.isRequired,
  fetchPartnerUshers: PropTypes.func.isRequired,
  fetchPartnerUsers: PropTypes.func.isRequired,
  fetchSights: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number,
    label: PropTypes.string,
    users: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  partnerUshers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  partnerUsers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  resetEmail: PropTypes.func.isRequired,
  router: PropTypes.shape({}).isRequired,
  setPartnerUserBlocked: PropTypes.func.isRequired,
  setPartnerUsherBlocked: PropTypes.func.isRequired,
  sights: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  successMessage: PropTypes.string,
  tab: PropTypes.string,
  updatePartnerUsher: PropTypes.func.isRequired,
  updatePartnerUser: PropTypes.func.isRequired,
};

PartnersEdit.defaultProps = {
  itemId: null,
  error: null,
  errorUsers: null,
  item: null,
  successMessage: null,
  tab: null,
};

const mapStateToProps = state => ({
  error: partnersSelectors.getError(state),
  errorUsers: usersSelectors.getErrors(state),
  item: partnersSelectors.getItem(state),
  partnerUshers: usersSelectors.getUshers(state),
  partnerUsers: usersSelectors.getUsers(state),
  sights: sightsSelectors.getSights(state),
});

const mapDispatchToProps = {
  changeDefaultTranslation: partnersActions.changeDefaultTranslation,
  changePartnerUsherPassword: usersActions.changePartnerUsherPassword,
  changePartnerUserPassword: usersActions.changePartnerUserPassword,
  clearError: partnersActions.clearError,
  clearUsersError: usersActions.clearErrors,
  clearItem: partnersActions.clearItem,
  createPartnerUsher: usersActions.createPartnerUsher,
  createPartnerUser: usersActions.createPartnerUser,
  deletePartnerUsher: usersActions.deletePartnerUsher,
  deletePartnerUser: usersActions.deletePartnerUser,
  deleteTranslation: partnersActions.deleteTranslation,
  fetchItem: partnersActions.fetchItem,
  fetchPartnerUshers: usersActions.fetchPartnerUshers,
  fetchPartnerUsers: usersActions.fetchPartnerUsers,
  fetchSights: sightsActions.fetchList,
  resetEmail: usersActions.resetEmail,
  setPartnerUserBlocked: usersActions.setPartnerUserBlocked,
  setPartnerUsherBlocked: usersActions.setPartnerUsherBlocked,
  updatePartnerUsher: usersActions.updatePartnerUsher,
  updatePartnerUser: usersActions.updatePartnerUser,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withRouter,
  withStyles(styles),
)(PartnersEdit);
