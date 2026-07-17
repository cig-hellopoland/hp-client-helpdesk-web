import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect, ReactReduxContext } from 'react-redux';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import Layout from 'components/Layout';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Select from '@material-ui/core/Select';
import Snackbar from '@material-ui/core/Snackbar';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import withAuth from 'services/auth/withAuth';
import { selectors as profileSelectors } from 'redux/profile';
import { DEFAULT_LANGUAGE } from 'utils/translations';

const ROLE_OPTIONS = [
  {
    value: 'ROOT',
    label: 'Root',
    description: 'Pełny dostęp techniczny i administracyjny.',
  },
  {
    value: 'ADMIN',
    label: 'Administrator',
    description: 'Pełny dostęp administracyjny bez zarządzania rootami.',
  },
  {
    value: 'SALESMAN',
    label: 'Salesman',
    description: 'Dotychczasowa rola sprzedażowa.',
  },
  {
    value: 'HELPDESK_PARTNER_MANAGER',
    label: 'Manager partnerów',
    description: 'Zarządzanie partnerami oraz ich treściami w przypisanym zakresie.',
  },
  {
    value: 'HELPDESK_CONTENT_MANAGER',
    label: 'Manager treści',
    description: 'Tworzenie i edycja obiektów, ofert oraz biletów w przypisanym zakresie.',
  },
  {
    value: 'HELPDESK_SUPPORT',
    label: 'Support',
    description: 'Podstawowa obsługa i podgląd w przypisanym zakresie.',
  },
];

const emptyForm = {
  id: null,
  name: '',
  email: '',
  password: '',
  role: 'HELPDESK_SUPPORT',
  allowedHelpdeskPartnerIds: [],
  allowedHelpdeskSightIds: [],
};

const SCOPE_LIST_LIMIT = 30;

const styles = {
  root: {
    minHeight: '100%',
  },
  content: {
    padding: 16,
  },
  paper: {
    flex: 1,
    overflow: 'hidden',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  toolbar: {
    padding: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    fontSize: 14,
    background: '#f50057',
  },
  nameCell: {
    alignItems: 'center',
    display: 'flex',
  },
  nameText: {
    marginLeft: 8,
  },
  dialogContent: {
    minWidth: 420,
  },
  userDialogPaper: {
    maxHeight: 'calc(100% - 32px)',
    maxWidth: 'calc(100% - 32px)',
    width: 760,
  },
  userDialogContent: {
    minWidth: 620,
  },
  scopePicker: {
    position: 'relative',
  },
  scopeDropdown: {
    maxHeight: 260,
    overflowY: 'auto',
  },
  scopePopper: {
    zIndex: 1500,
  },
  scopeDropdownButton: {
    padding: 4,
  },
  scopeMenuItem: {
    fontSize: 14,
    minHeight: 36,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  scopeMenuCheckbox: {
    height: 32,
    width: 32,
  },
  scopeMenuText: {
    fontSize: 14,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

const getInitials = (name, email) => {
  const source = (name || email || '').trim();
  if (!source) {
    return '?';
  }
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
};

const getRoleLabel = (roles = []) => {
  if (roles.includes('ROOT')) {
    return 'Root';
  }
  const role = ROLE_OPTIONS.find(option => roles.includes(option.value));
  return role ? role.label : (roles[0] || '-');
};

const getRoleDescription = role => (
  (ROLE_OPTIONS.find(option => option.value === role) || {}).description || ''
);

const getRolesForSave = role => (role === 'ROOT' ? ['ROOT', 'ADMIN'] : [role]);

class UsersList extends React.Component {
  static contextType = ReactReduxContext;

  state = {
    deleteDialogOpen: false,
    form: { ...emptyForm },
    formOpen: false,
    formMode: 'create',
    isFetching: false,
    menuAnchor: null,
    menuUserId: null,
    passwordDialogOpen: false,
    passwordForm: { id: null, password: '', confirmPassword: '' },
    partnerScopeFilter: '',
    partnerScopeOpen: false,
    partners: [],
    sightScopeFilter: '',
    sightScopeOpen: false,
    showFormPassword: false,
    showPasswordDialogConfirmPassword: false,
    showPasswordDialogPassword: false,
    snackbarOpen: false,
    snackbarMessage: '',
    sights: [],
    users: [],
  };

  componentDidMount() {
    this.fetchUsers();
    this.fetchScopeDictionaries();
  }

  componentDidUpdate(prevProps) {
    if (!this.canManageProfile(prevProps.profile) && this.canManage()) {
      this.fetchUsers();
      this.fetchScopeDictionaries();
    }
  }

  getHttpClient = () => {
    const { store } = this.context || {};
    const { logicMiddleware } = store || {};
    return logicMiddleware && logicMiddleware.httpClient;
  };

  getSelectedUser = () => {
    const { menuUserId, users } = this.state;
    return users.find(user => user.id === menuUserId);
  };

  canManage = () => {
    const { profile } = this.props;
    return this.canManageProfile(profile);
  };

  canManageProfile = (profile) => {
    const roles = (profile && profile.roles) || [];
    return roles.includes('ADMIN') || roles.includes('ROOT');
  };

  fetchUsers = () => {
    const httpClient = this.getHttpClient();
    if (!httpClient || !this.canManage()) {
      return;
    }
    this.setState({ isFetching: true });
    httpClient.get('/users')
      .then(({ data }) => this.setState({ users: data || [] }))
      .catch(() => this.openSnackbar('Nie udało się pobrać użytkowników'))
      .finally(() => this.setState({ isFetching: false }));
  };

  fetchScopeDictionaries = () => {
    const httpClient = this.getHttpClient();
    if (!httpClient || !this.canManage()) {
      return;
    }
    const options = {
      headers: {
        'Content-Language': DEFAULT_LANGUAGE,
      },
    };

    httpClient.get('/partners', options)
      .then(({ data }) => this.setState({ partners: this.sortByName((data && data.items) || []) }))
      .catch(() => this.openSnackbar('Nie udało się pobrać partnerów'));

    httpClient.get('/sights', options)
      .then(({ data }) => this.setState({ sights: this.sortByName((data && data.items) || []) }))
      .catch(() => this.openSnackbar('Nie udało się pobrać obiektów'));
  };

  openSnackbar = snackbarMessage => this.setState({ snackbarOpen: true, snackbarMessage });

  closeSnackbar = () => this.setState({ snackbarOpen: false, snackbarMessage: '' });

  openCreateForm = () => this.setState({
    form: { ...emptyForm, role: this.getAvailableRoleOptions()[0].value },
    formMode: 'create',
    formOpen: true,
    partnerScopeFilter: '',
    partnerScopeOpen: false,
    sightScopeFilter: '',
    sightScopeOpen: false,
    showFormPassword: false,
  });

  openEditForm = (user) => {
    if (!user || !this.canModifyUser(user)) {
      return;
    }
    const roleOptions = this.getAvailableRoleOptions();
    this.setState({
      form: {
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.roles && user.roles.includes('ROOT') ? 'ROOT' : (
          roleOptions.find(option => (user.roles || []).includes(option.value)) || roleOptions[0]
        ).value,
        allowedHelpdeskPartnerIds: user.allowedHelpdeskPartnerIds || [],
        allowedHelpdeskSightIds: user.allowedHelpdeskSightIds || [],
      },
      formMode: 'edit',
      formOpen: true,
      partnerScopeFilter: '',
      partnerScopeOpen: false,
      sightScopeFilter: '',
      sightScopeOpen: false,
      showFormPassword: false,
    });
    this.closeMenu();
  };

  closeForm = () => this.setState({
    formOpen: false,
    form: { ...emptyForm },
    showFormPassword: false,
  });

  handleFormChange = name => (event) => {
    const { value } = event.target;
    this.setState(state => ({ form: { ...state.form, [name]: value } }));
  };

  togglePasswordVisibility = name => () => this.setState(state => ({
    [name]: !state[name],
  }));

  preventMouseDown = (event) => {
    event.preventDefault();
  };

  handleScopeFilterChange = name => (event) => {
    const { value } = event.target;
    this.setState({ [name]: value });
  };

  openScopeMenu = name => () => {
    this.setState({ [name]: true });
  };

  closeScopeMenu = name => () => {
    this.setState({ [name]: false });
  };

  toggleScopeMenu = name => (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState(state => ({
      [name]: !state[name],
    }));
  };

  handleScopeKeyDown = name => (event) => {
    if (event.key === 'Escape') {
      this.setState({ [name]: false });
    }
  };

  keepScopeMenuOpen = (event) => {
    event.preventDefault();
  };

  handleRoleChange = (event) => {
    const { value } = event.target;
    this.setState(state => ({
      form: {
        ...state.form,
        role: value,
        allowedHelpdeskPartnerIds: this.isScopedRole(value)
          ? state.form.allowedHelpdeskPartnerIds
          : [],
        allowedHelpdeskSightIds: this.isScopedRole(value)
          ? state.form.allowedHelpdeskSightIds
          : [],
      },
    }));
  };

  toggleAllowedPartner = partnerId => () => {
    const normalizedPartnerId = Number(partnerId);
    this.setState((state) => {
      const currentIds = state.form.allowedHelpdeskPartnerIds || [];
      const allowedHelpdeskPartnerIds = currentIds.includes(normalizedPartnerId)
        ? currentIds.filter(id => id !== normalizedPartnerId)
        : currentIds.concat(normalizedPartnerId);

      return {
        form: {
          ...state.form,
          allowedHelpdeskPartnerIds,
          allowedHelpdeskSightIds: this.getSightsForPartners(allowedHelpdeskPartnerIds)
            .map(sight => Number(sight.id))
            .filter(id => (state.form.allowedHelpdeskSightIds || []).includes(id)),
        },
      };
    });
  };

  clearAllowedPartners = () => {
    this.setState(state => ({
      form: {
        ...state.form,
        allowedHelpdeskPartnerIds: [],
      },
    }));
  };

  toggleAllowedSight = sightId => () => {
    const normalizedSightId = Number(sightId);
    this.setState((state) => {
      const currentIds = state.form.allowedHelpdeskSightIds || [];
      return {
        form: {
          ...state.form,
          allowedHelpdeskSightIds: currentIds.includes(normalizedSightId)
            ? currentIds.filter(id => id !== normalizedSightId)
            : currentIds.concat(normalizedSightId),
        },
      };
    });
  };

  clearAllowedSights = () => {
    this.setState(state => ({
      form: {
        ...state.form,
        allowedHelpdeskSightIds: [],
      },
    }));
  };

  saveForm = () => {
    const httpClient = this.getHttpClient();
    const { form, formMode } = this.state;
    const data = {
      email: form.email,
      name: form.name,
      roles: getRolesForSave(form.role),
      allowedHelpdeskPartnerIds: this.isScopedRole(form.role)
        ? form.allowedHelpdeskPartnerIds
        : [],
      allowedHelpdeskSightIds: this.isScopedRole(form.role)
        ? form.allowedHelpdeskSightIds
        : [],
    };
    if (formMode === 'create') {
      data.password = form.password;
    }
    const request = formMode === 'create'
      ? httpClient.post('/users', data)
      : httpClient.put(`/users/${form.id}`, data);

    request
      .then(() => {
        this.openSnackbar('Zapisano użytkownika');
        this.closeForm();
        this.fetchUsers();
      })
      .catch(() => this.openSnackbar('Nie udało się zapisać użytkownika'));
  };

  openPasswordDialog = (user) => {
    if (!user || !this.canModifyUser(user)) {
      return;
    }
    this.setState({
      passwordDialogOpen: true,
      passwordForm: { id: user.id, password: '', confirmPassword: '' },
      showPasswordDialogConfirmPassword: false,
      showPasswordDialogPassword: false,
    });
    this.closeMenu();
  };

  closePasswordDialog = () => this.setState({
    passwordDialogOpen: false,
    passwordForm: { id: null, password: '', confirmPassword: '' },
    showPasswordDialogConfirmPassword: false,
    showPasswordDialogPassword: false,
  });

  handlePasswordChange = name => (event) => {
    const { value } = event.target;
    this.setState(state => ({ passwordForm: { ...state.passwordForm, [name]: value } }));
  };

  savePassword = () => {
    const httpClient = this.getHttpClient();
    const { passwordForm } = this.state;

    if (!passwordForm.password || !passwordForm.confirmPassword) {
      this.openSnackbar('Podaj i potwierdź nowe hasło');
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      this.openSnackbar('Hasła nie są takie same');
      return;
    }

    httpClient.patch(`/users/${passwordForm.id}/password`, { password: passwordForm.password })
      .then(() => {
        this.openSnackbar('Zmieniono hasło');
        this.closePasswordDialog();
      })
      .catch(() => this.openSnackbar('Nie udało się zmienić hasła'));
  };

  toggleBlocked = (user) => {
    if (!user || !this.canSetBlocked(user)) {
      return;
    }
    const httpClient = this.getHttpClient();
    const blocked = !user.blocked;
    httpClient.patch(`/users/${user.id}/blocked`, { blocked })
      .then(() => {
        this.openSnackbar(blocked ? 'Zablokowano użytkownika' : 'Odblokowano użytkownika');
        this.closeMenu();
        this.fetchUsers();
      })
      .catch(() => this.openSnackbar('Nie udało się zmienić statusu'));
  };

  openDeleteDialog = (user) => {
    if (!user || !this.canDeleteUser(user)) {
      return;
    }
    this.setState({ deleteDialogOpen: true });
    this.closeMenu(false);
  };

  closeDeleteDialog = () => this.setState({ deleteDialogOpen: false, menuUserId: null });

  deleteUser = () => {
    const httpClient = this.getHttpClient();
    const { menuUserId } = this.state;
    httpClient.delete(`/users/${menuUserId}`)
      .then(() => {
        this.openSnackbar('Usunięto użytkownika');
        this.closeDeleteDialog();
        this.fetchUsers();
      })
      .catch(() => this.openSnackbar('Nie udało się usunąć użytkownika'));
  };

  openMenu = (event, userId) => this.setState({
    menuAnchor: event.currentTarget,
    menuUserId: userId,
  });

  closeMenu = (clearUser = true) => this.setState({
    menuAnchor: null,
    ...(clearUser ? { menuUserId: null } : {}),
  });

  isCurrentRoot = () => {
    const { profile } = this.props;
    return ((profile && profile.roles) || []).includes('ROOT');
  };

  isCurrentUser = (user) => {
    const { profile } = this.props;
    return Boolean(user && profile && user.id === profile.id);
  };

  isAdminLevelUser = user => ((user && user.roles) || [])
    .some(role => role === 'ADMIN' || role === 'ROOT');

  canModifyUser = user => Boolean(user && (this.isCurrentRoot() || !this.isAdminLevelUser(user)));

  canSetBlocked = user => this.canModifyUser(user)
    && (Boolean(user && user.blocked) || !this.isCurrentUser(user));

  canDeleteUser = user => this.canModifyUser(user) && !this.isCurrentUser(user);

  getOptionLabel = item => (item && (item.name || item.email || String(item.id))) || '';

  normalizeFilter = value => (value || '')
    .toLocaleLowerCase('pl')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  sortByName = items => items.slice().sort((a, b) => this.getOptionLabel(a).localeCompare(
    this.getOptionLabel(b),
    'pl',
    { sensitivity: 'base' },
  ));

  getFilteredScopeOptions = (items, filterText) => {
    const normalizedFilter = this.normalizeFilter(filterText);
    return items.filter((item) => {
      if (!normalizedFilter) {
        return true;
      }
      return this.normalizeFilter(this.getOptionLabel(item)).includes(normalizedFilter);
    }).slice(0, SCOPE_LIST_LIMIT);
  };

  isScopedRole = role => [
    'HELPDESK_PARTNER_MANAGER',
    'HELPDESK_CONTENT_MANAGER',
    'HELPDESK_SUPPORT',
  ].includes(role);

  getPartnerName = (partnerId) => {
    const { partners } = this.state;
    const partner = partners.find(item => item.id === Number(partnerId));
    return partner ? partner.name : `#${partnerId}`;
  };

  getSightName = (sightId) => {
    const { sights } = this.state;
    const sight = sights.find(item => item.id === Number(sightId));
    return sight ? sight.name : `#${sightId}`;
  };

  getSightsForPartners = (partnerIds) => {
    const { sights } = this.state;
    if (!partnerIds || !partnerIds.length) {
      return sights;
    }
    return sights.filter(sight => !sight.partnerId || partnerIds.includes(Number(sight.partnerId)));
  };

  getScopeSummary = (selectedIds, emptyLabel, getName) => {
    const ids = selectedIds || [];
    if (!ids.length) {
      return emptyLabel;
    }
    if (ids.length <= 2) {
      return ids.map(id => getName(id)).join(', ');
    }
    return `${ids.length} wybranych`;
  };

  getScopeDropdownStyle = anchor => ({
    ...styles.scopeDropdown,
    width: anchor ? anchor.clientWidth : undefined,
  });

  getAvailableRoleOptions = () => {
    if (this.isCurrentRoot()) {
      return ROLE_OPTIONS;
    }
    return ROLE_OPTIONS.filter(option => option.value !== 'ROOT' && option.value !== 'ADMIN');
  };

  render() {
    const {
      deleteDialogOpen,
      form,
      formMode,
      formOpen,
      isFetching,
      menuAnchor,
      passwordDialogOpen,
      passwordForm,
      partnerScopeFilter,
      partnerScopeOpen,
      partners,
      sightScopeFilter,
      sightScopeOpen,
      showFormPassword,
      showPasswordDialogConfirmPassword,
      showPasswordDialogPassword,
      snackbarMessage,
      snackbarOpen,
      users,
    } = this.state;
    const selectedUser = this.getSelectedUser();
    const roleOptions = this.getAvailableRoleOptions();
    const scopedRole = this.isScopedRole(form.role);
    const allowedPartnerIds = form.allowedHelpdeskPartnerIds || [];
    const allowedSightIds = form.allowedHelpdeskSightIds || [];
    const visibleSights = this.getSightsForPartners(allowedPartnerIds);
    const visiblePartners = this.getFilteredScopeOptions(
      partners,
      partnerScopeFilter,
    );
    const filteredSights = this.getFilteredScopeOptions(
      visibleSights,
      sightScopeFilter,
    );
    const partnerSummary = this.getScopeSummary(
      allowedPartnerIds,
      'Wszyscy',
      this.getPartnerName,
    );
    const sightSummary = this.getScopeSummary(
      allowedSightIds,
      'Wszystkie',
      this.getSightName,
    );
    const partnerInputValue = partnerScopeOpen ? partnerScopeFilter : partnerSummary;
    const sightInputValue = sightScopeOpen ? sightScopeFilter : sightSummary;

    if (!this.canManage()) {
      return (
        <Layout>
          <div style={styles.content}>
            <Typography variant="h6">Brak uprawnień</Typography>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <Grid container style={styles.root}>
          <Paper style={styles.paper}>
            <Grid container alignItems="center" justify="space-between" style={styles.toolbar}>
              <Typography variant="h6">Użytkownicy helpdesku</Typography>
              <Button color="secondary" onClick={this.openCreateForm}>
                <AddIcon />
                Dodaj
              </Button>
            </Grid>
            <div style={styles.tableWrapper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Imię</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rola</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <div style={styles.nameCell}>
                          <Avatar src={user.picture || undefined} style={styles.avatar}>
                            {!user.picture && getInitials(user.name, user.email)}
                          </Avatar>
                          <span style={styles.nameText}>{user.name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleLabel(user.roles)}</TableCell>
                      <TableCell>{user.blocked ? 'Zablokowany' : 'Aktywny'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          disabled={!this.canModifyUser(user)}
                          onClick={event => this.openMenu(event, user.id)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!users.length && !isFetching && (
                  <TableRow>
                    <TableCell colSpan={5}>Brak użytkowników</TableCell>
                  </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Paper>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => this.closeMenu()}
          >
            <MenuItem
              disabled={!this.canModifyUser(selectedUser)}
              onClick={() => this.openEditForm(selectedUser)}
            >
              Edytuj
            </MenuItem>
            <MenuItem
              disabled={!this.canModifyUser(selectedUser)}
              onClick={() => this.openPasswordDialog(selectedUser)}
            >
              Zmień hasło
            </MenuItem>
            <MenuItem
              disabled={!this.canSetBlocked(selectedUser)}
              onClick={() => this.toggleBlocked(selectedUser)}
            >
              {selectedUser && selectedUser.blocked ? 'Odblokuj' : 'Zablokuj'}
            </MenuItem>
            <MenuItem
              disabled={!this.canDeleteUser(selectedUser)}
              onClick={() => this.openDeleteDialog(selectedUser)}
            >
              Usuń
            </MenuItem>
          </Menu>

          <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            open={formOpen}
            PaperProps={{ style: styles.userDialogPaper }}
          >
            <DialogTitle>{formMode === 'create' ? 'Dodaj użytkownika' : 'Edytuj użytkownika'}</DialogTitle>
            <DialogContent style={styles.userDialogContent}>
              <Grid container spacing={16}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    autoComplete="off"
                    label="Imię i nazwisko"
                    name="helpdesk-user-display-name"
                    value={form.name}
                    onChange={this.handleFormChange('name')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    autoComplete="off"
                    label="Email"
                    name="helpdesk-user-contact"
                    value={form.email}
                    onChange={this.handleFormChange('email')}
                  />
                </Grid>
                {formMode === 'create' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      autoComplete="new-password"
                      label="Hasło"
                      name="helpdesk-user-new-password"
                      type={showFormPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={this.handleFormChange('password')}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={showFormPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                              onClick={this.togglePasswordVisibility('showFormPassword')}
                              onMouseDown={this.preventMouseDown}
                            >
                              {showFormPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="helpdesk-user-role">Rola</InputLabel>
                    <Select
                      fullWidth
                      input={<Input id="helpdesk-user-role" />}
                      value={form.role}
                      onChange={this.handleRoleChange}
                    >
                      {roleOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{getRoleDescription(form.role)}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Zakres uprawnień</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Brak wyboru oznacza dostęp do wszystkich partnerów albo obiektów w ramach roli.
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <ClickAwayListener onClickAway={this.closeScopeMenu('partnerScopeOpen')}>
                    <div
                      ref={(element) => { this.partnerScopeAnchor = element; }}
                      style={styles.scopePicker}
                    >
                      <TextField
                        fullWidth
                        disabled={!scopedRole}
                        label="Partnerzy"
                        value={partnerInputValue}
                        onChange={this.handleScopeFilterChange('partnerScopeFilter')}
                        onFocus={this.openScopeMenu('partnerScopeOpen')}
                        onKeyDown={this.handleScopeKeyDown('partnerScopeOpen')}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="Rozwiń listę partnerów"
                                disabled={!scopedRole}
                                onClick={this.toggleScopeMenu('partnerScopeOpen')}
                                style={styles.scopeDropdownButton}
                              >
                                <ArrowDropDownIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Popper
                        anchorEl={this.partnerScopeAnchor}
                        open={scopedRole && partnerScopeOpen}
                        placement="bottom-start"
                        style={styles.scopePopper}
                      >
                        <Paper
                          onMouseUp={this.keepScopeMenuOpen}
                          style={this.getScopeDropdownStyle(this.partnerScopeAnchor)}
                        >
                          <MenuItem
                            onClick={this.clearAllowedPartners}
                            style={styles.scopeMenuItem}
                          >
                            <Checkbox
                              checked={!allowedPartnerIds.length}
                              style={styles.scopeMenuCheckbox}
                            />
                            <ListItemText
                              primary="Wszyscy"
                              primaryTypographyProps={{ style: styles.scopeMenuText }}
                            />
                          </MenuItem>
                          {visiblePartners.map(partner => (
                            <MenuItem
                              key={partner.id}
                              onClick={this.toggleAllowedPartner(partner.id)}
                              style={styles.scopeMenuItem}
                            >
                              <Checkbox
                                checked={allowedPartnerIds.includes(Number(partner.id))}
                                style={styles.scopeMenuCheckbox}
                              />
                              <ListItemText
                                primary={partner.name}
                                primaryTypographyProps={{ style: styles.scopeMenuText }}
                              />
                            </MenuItem>
                          ))}
                          {!visiblePartners.length && (
                            <MenuItem disabled style={styles.scopeMenuItem}>
                              Brak wyników
                            </MenuItem>
                          )}
                        </Paper>
                      </Popper>
                      <FormHelperText>
                        {scopedRole ? 'Ogranicza pracę użytkownika do wybranych partnerów.' : 'Ta rola ma zakres globalny.'}
                      </FormHelperText>
                    </div>
                  </ClickAwayListener>
                </Grid>
                <Grid item xs={12}>
                  <ClickAwayListener onClickAway={this.closeScopeMenu('sightScopeOpen')}>
                    <div
                      ref={(element) => { this.sightScopeAnchor = element; }}
                      style={styles.scopePicker}
                    >
                      <TextField
                        fullWidth
                        disabled={!scopedRole}
                        label="Obiekty"
                        value={sightInputValue}
                        onChange={this.handleScopeFilterChange('sightScopeFilter')}
                        onFocus={this.openScopeMenu('sightScopeOpen')}
                        onKeyDown={this.handleScopeKeyDown('sightScopeOpen')}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="Rozwiń listę obiektów"
                                disabled={!scopedRole}
                                onClick={this.toggleScopeMenu('sightScopeOpen')}
                                style={styles.scopeDropdownButton}
                              >
                                <ArrowDropDownIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Popper
                        anchorEl={this.sightScopeAnchor}
                        open={scopedRole && sightScopeOpen}
                        placement="bottom-start"
                        style={styles.scopePopper}
                      >
                        <Paper
                          onMouseUp={this.keepScopeMenuOpen}
                          style={this.getScopeDropdownStyle(this.sightScopeAnchor)}
                        >
                          <MenuItem
                            onClick={this.clearAllowedSights}
                            style={styles.scopeMenuItem}
                          >
                            <Checkbox
                              checked={!allowedSightIds.length}
                              style={styles.scopeMenuCheckbox}
                            />
                            <ListItemText
                              primary="Wszystkie"
                              primaryTypographyProps={{ style: styles.scopeMenuText }}
                            />
                          </MenuItem>
                          {filteredSights.map(sight => (
                            <MenuItem
                              key={sight.id}
                              onClick={this.toggleAllowedSight(sight.id)}
                              style={styles.scopeMenuItem}
                            >
                              <Checkbox
                                checked={allowedSightIds.includes(Number(sight.id))}
                                style={styles.scopeMenuCheckbox}
                              />
                              <ListItemText
                                primary={sight.name}
                                primaryTypographyProps={{ style: styles.scopeMenuText }}
                              />
                            </MenuItem>
                          ))}
                          {!filteredSights.length && (
                            <MenuItem disabled style={styles.scopeMenuItem}>
                              Brak wyników
                            </MenuItem>
                          )}
                        </Paper>
                      </Popper>
                      <FormHelperText>
                      Obiekty zawężają zakres dodatkowo względem partnerów.
                      </FormHelperText>
                    </div>
                  </ClickAwayListener>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.closeForm}>Anuluj</Button>
              <Button color="secondary" onClick={this.saveForm}>Zapisz</Button>
            </DialogActions>
          </Dialog>

          <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            open={passwordDialogOpen}
          >
            <DialogTitle>Zmiana hasła</DialogTitle>
            <DialogContent style={styles.dialogContent}>
              <TextField
                fullWidth
                label="Nowe hasło"
                type={showPasswordDialogPassword ? 'text' : 'password'}
                value={passwordForm.password}
                onChange={this.handlePasswordChange('password')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPasswordDialogPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                        onClick={this.togglePasswordVisibility('showPasswordDialogPassword')}
                        onMouseDown={this.preventMouseDown}
                      >
                        {showPasswordDialogPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Potwierdź nowe hasło"
                type={showPasswordDialogConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={this.handlePasswordChange('confirmPassword')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPasswordDialogConfirmPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                        onClick={this.togglePasswordVisibility('showPasswordDialogConfirmPassword')}
                        onMouseDown={this.preventMouseDown}
                      >
                        {showPasswordDialogConfirmPassword
                          ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.closePasswordDialog}>Anuluj</Button>
              <Button color="secondary" onClick={this.savePassword}>Zapisz</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={deleteDialogOpen} onClose={this.closeDeleteDialog}>
            <DialogTitle>Usunięcie użytkownika</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Czy na pewno chcesz usunąć tego użytkownika?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.closeDeleteDialog}>Anuluj</Button>
              <Button color="secondary" onClick={this.deleteUser}>Usuń</Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            autoHideDuration={4000}
            message={snackbarMessage}
            onClose={this.closeSnackbar}
            open={snackbarOpen}
          />
        </Grid>
      </Layout>
    );
  }
}

UsersList.propTypes = {
  profile: PropTypes.shape({
    id: PropTypes.number,
    roles: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

const mapStateToProps = state => ({
  profile: profileSelectors.getProfile(state),
});

export default compose(
  withAuth(),
  connect(mapStateToProps),
)(UsersList);
