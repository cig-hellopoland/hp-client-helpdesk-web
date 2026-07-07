import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Snackbar from '@material-ui/core/Snackbar';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import EmptyView from 'components/EmptyView';
import TableHead from 'components/Table/TableHead';
import withAuth from 'services/auth/withAuth';

const ROLE_ADMIN = 'PARTNER_ADMIN';
const ROLE_SALESMAN = 'PARTNER_SALESMAN';

const tableColumns = [
  { id: 'email', label: 'E-mail' },
  { id: 'name', label: 'Imię i nazwisko' },
  { id: 'role', label: 'Rola' },
  { id: 'sights', label: 'Obiekty' },
  { id: 'status', label: 'Status' },
  { id: 'menu', label: '' },
];

const usherTableColumns = [
  { id: 'email', label: 'E-mail' },
  { id: 'name', label: 'Imie i nazwisko' },
  { id: 'status', label: 'Status' },
  { id: 'menu', label: '' },
];

const emptyForm = {
  id: null,
  name: '',
  email: '',
  password: '',
  role: ROLE_ADMIN,
  allowedSightIds: [],
};

const emptyUsherForm = {
  id: null,
  name: '',
  email: '',
  password: '',
};

const styles = theme => ({
  root: {
    minHeight: '100%',
  },
  actions: {
    minWidth: 90,
  },
  dialogContent: {
    minWidth: 520,
  },
  formControl: {
    marginTop: theme.spacing.unit,
  },
  icon: {
    marginRight: theme.spacing.unit,
  },
  buttonGroup: {
    '& > * + *': {
      marginLeft: theme.spacing.unit,
    },
  },
  toolbar: {
    padding: theme.spacing.unit,
  },
  sectionTitle: {
    padding: theme.spacing.unit,
  },
});

class PartnerUsersList extends React.Component {
  state = {
    deleteDialogOpen: false,
    deleteDialogProps: {},
    menuAnchor: null,
    menuItemId: null,
    menuType: 'user',
    passwordDialogOpen: false,
    passwordDialogProps: {},
    snackbarOpen: false,
    snackbarMessage: '',
    userDialogOpen: false,
    userDialogMode: 'create',
    userForm: { ...emptyForm },
    usherDialogOpen: false,
    usherDialogMode: 'create',
    usherForm: { ...emptyUsherForm },
  };

  componentDidMount() {
    this.handleFetchItems();
    this.handleFetchUshers();
    this.handleFetchSights();
  }

  componentDidUpdate(prevProps) {
    const { partnerId } = this.props;
    if (partnerId && partnerId !== prevProps.partnerId) {
      this.handleFetchItems();
      this.handleFetchUshers();
      this.handleFetchSights();
    }
  }

  getItem = (itemId) => {
    const { items } = this.props;

    return (items || []).find(item => item.id === itemId);
  };

  getUsher = (itemId) => {
    const { ushers } = this.props;

    return (ushers || []).find(item => item.id === itemId);
  };

  getSightName = (sightId) => {
    const { sights } = this.props;
    const sight = (sights || []).find(item => item.id === sightId);
    return sight ? sight.name : `#${sightId}`;
  };

  getAllowedSightsLabel = (item) => {
    if (!this.isSalesman(item)) {
      return 'Wszystkie';
    }

    const ids = item.allowedSightIds || [];
    if (!ids.length) {
      return 'Brak';
    }

    return ids.map(this.getSightName).join(', ');
  };

  getRole = (item) => {
    const roles = item.roles || [];
    if (roles.includes(ROLE_ADMIN)) {
      return ROLE_ADMIN;
    }
    if (roles.includes(ROLE_SALESMAN)) {
      return ROLE_SALESMAN;
    }
    return 'PARTNER';
  };

  getRoleLabel = (item) => {
    const role = this.getRole(item);
    if (role === ROLE_ADMIN) {
      return 'Admin';
    }
    if (role === ROLE_SALESMAN) {
      return 'Salesman';
    }
    return 'Konto główne';
  };

  getSelectedItem = () => {
    const { menuItemId, menuType } = this.state;
    return menuType === 'usher' ? this.getUsher(menuItemId) : this.getItem(menuItemId);
  };

  isPanelUser = item => item && [ROLE_ADMIN, ROLE_SALESMAN].includes(this.getRole(item));

  isSalesman = item => item && this.getRole(item) === ROLE_SALESMAN;

  handleCreateUser = () => this.setState({
    userDialogOpen: true,
    userDialogMode: 'create',
    userForm: { ...emptyForm },
  });

  handleCreateUsher = () => this.setState({
    usherDialogOpen: true,
    usherDialogMode: 'create',
    usherForm: { ...emptyUsherForm },
  });

  handleEditUser = (item) => {
    if (!item) {
      return;
    }

    this.setState({
      userDialogOpen: true,
      userDialogMode: 'edit',
      userForm: {
        id: item.id,
        name: item.name || '',
        email: item.email || '',
        password: '',
        role: this.getRole(item) === ROLE_SALESMAN ? ROLE_SALESMAN : ROLE_ADMIN,
        allowedSightIds: item.allowedSightIds || [],
      },
    });
    this.handleMenuClose();
  };

  handleEditUsher = (item) => {
    if (!item) {
      return;
    }

    this.setState({
      usherDialogOpen: true,
      usherDialogMode: 'edit',
      usherForm: {
        id: item.id,
        name: item.name || '',
        email: item.email || '',
        password: '',
      },
    });
    this.handleMenuClose();
  };

  handleUserDialogClose = () => this.setState({
    userDialogOpen: false,
    userForm: { ...emptyForm },
  });

  handleUsherDialogClose = () => this.setState({
    usherDialogOpen: false,
    usherForm: { ...emptyUsherForm },
  });

  handleUserFormChange = name => (event) => {
    const { value } = event.target;
    this.setState(state => ({
      userForm: {
        ...state.userForm,
        [name]: value,
      },
    }));
  };

  handleUsherFormChange = name => (event) => {
    const { value } = event.target;
    this.setState(state => ({
      usherForm: {
        ...state.usherForm,
        [name]: value,
      },
    }));
  };

  handleUserRoleChange = (event) => {
    const { value } = event.target;
    this.setState(state => ({
      userForm: {
        ...state.userForm,
        role: value,
        allowedSightIds: value === ROLE_ADMIN ? [] : state.userForm.allowedSightIds,
      },
    }));
  };

  handleAllowedSightsChange = (event) => {
    const ids = (event.target.value || []).map(value => Number(value));
    this.setState(state => ({
      userForm: {
        ...state.userForm,
        allowedSightIds: ids,
      },
    }));
  };

  handleUserDialogAccept = () => {
    const {
      onCreateUser, onUpdateUser, partnerId,
    } = this.props;
    const { userDialogMode, userForm } = this.state;
    const data = {
      name: userForm.name,
      email: userForm.email,
      password: userForm.password,
      roles: [userForm.role],
      allowedSightIds: userForm.role === ROLE_SALESMAN ? userForm.allowedSightIds : [],
    };
    const callbacks = {
      onFailure: this.handleRequestFailure,
      onSuccess: () => {
        this.handleSnackbarOpen('Zapisano użytkownika partnera');
        this.handleUserDialogClose();
        this.handleFetchItems();
      },
    };

    if (userDialogMode === 'edit') {
      onUpdateUser({
        partnerId,
        id: userForm.id,
        data,
        ...callbacks,
      });
      return;
    }

    onCreateUser({
      partnerId,
      data,
      ...callbacks,
    });
  };

  handleUsherDialogAccept = () => {
    const {
      onCreateUsher, onUpdateUsher, partnerId,
    } = this.props;
    const { usherDialogMode, usherForm } = this.state;
    const data = {
      name: usherForm.name,
      email: usherForm.email,
      password: usherForm.password,
    };
    const callbacks = {
      onFailure: this.handleRequestFailure,
      onSuccess: () => {
        this.handleSnackbarOpen('Zapisano biletera');
        this.handleUsherDialogClose();
        this.handleFetchUshers();
      },
    };

    if (usherDialogMode === 'edit') {
      onUpdateUsher({
        partnerId,
        id: usherForm.id,
        data,
        ...callbacks,
      });
      return;
    }

    onCreateUsher({
      partnerId,
      data,
      ...callbacks,
    });
  };

  handlePasswordDialogOpen = (item) => {
    if (!item) {
      return;
    }

    const { menuType } = this.state;
    this.setState({
      passwordDialogOpen: true,
      passwordDialogProps: {
        itemId: item.id,
        name: item.email,
        password: '',
        type: menuType,
      },
    });
    this.handleMenuClose();
  };

  handlePasswordDialogClose = () => this.setState({
    passwordDialogOpen: false,
    passwordDialogProps: {},
  });

  handlePasswordChange = (event) => {
    const { value: password } = event.target || {};

    this.setState(state => ({
      passwordDialogProps: {
        ...state.passwordDialogProps,
        password,
      },
    }));
  };

  handlePasswordDialogAccept = () => {
    const { onPasswordChange, onUsherPasswordChange } = this.props;
    const { passwordDialogProps } = this.state;
    const { itemId, password, type } = passwordDialogProps || {};
    const handler = type === 'usher' ? onUsherPasswordChange : onPasswordChange;

    if (itemId && password && handler) {
      handler(itemId, password, {
        onFailure: this.handleRequestFailure,
        onSuccess: () => {
          this.handleSnackbarOpen('Zmieniono hasło użytkownika partnera');
          this.handlePasswordDialogClose();
        },
      });
    }
  };

  handleDeleteDialogOpen = (item) => {
    if (!item) {
      return;
    }

    const { menuType } = this.state;
    this.setState({
      deleteDialogOpen: true,
      deleteDialogProps: {
        itemId: item.id,
        name: item.email,
        type: menuType,
      },
    });
    this.handleMenuClose();
  };

  handleDeleteDialogClose = () => this.setState({
    deleteDialogOpen: false,
    deleteDialogProps: {},
  });

  handleDeleteAccept = () => {
    const { onDeleteItem, onDeleteUsher } = this.props;
    const { deleteDialogProps } = this.state;
    const { itemId, type } = deleteDialogProps || {};
    const handler = type === 'usher' ? onDeleteUsher : onDeleteItem;

    if (itemId && handler) {
      handler(itemId, {
        onFailure: this.handleRequestFailure,
        onSuccess: () => {
          this.handleSnackbarOpen('Usunięto użytkownika partnera');
          this.handleDeleteDialogClose();
          if (type === 'usher') {
            this.handleFetchUshers();
          } else {
            this.handleFetchItems();
          }
        },
      });
    }
  };

  handleBlockedChange = (item) => {
    if (!item) {
      return;
    }

    const { onSetUserBlocked, onSetUsherBlocked } = this.props;
    const { menuType } = this.state;
    const blocked = !item.blocked;
    const handler = menuType === 'usher' ? onSetUsherBlocked : onSetUserBlocked;

    handler(item.id, blocked, {
      onFailure: this.handleRequestFailure,
      onSuccess: () => {
        this.handleSnackbarOpen(blocked ? 'Dezaktywowano uzytkownika' : 'Aktywowano uzytkownika');
        this.handleMenuClose();
        if (menuType === 'usher') {
          this.handleFetchUshers();
        } else {
          this.handleFetchItems();
        }
      },
    });
  };

  handleFetchItems = () => {
    const { onFetchItems } = this.props;

    if (onFetchItems) {
      onFetchItems();
    }
  };

  handleFetchUshers = () => {
    const { onFetchUshers } = this.props;

    if (onFetchUshers) {
      onFetchUshers();
    }
  };

  handleFetchSights = () => {
    const { onFetchSights, partnerId } = this.props;

    if (onFetchSights && partnerId) {
      onFetchSights(partnerId);
    }
  };

  handleMenuOpen = (event, itemId, menuType = 'user') => this.setState({
    menuAnchor: event.currentTarget,
    menuItemId: itemId,
    menuType,
  });

  handleMenuClose = () => this.setState({ menuAnchor: null });

  handleMenuExited = () => this.setState({ menuItemId: null });

  handleRequestFailure = (response) => {
    const { error } = this.props;
    const responseMessage = response && response.data && response.data.message;
    this.handleSnackbarOpen(
      responseMessage || (error && error.message) || 'Wystąpił błąd podczas zapisu użytkownika',
    );
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
      deleteDialogOpen,
      deleteDialogProps,
      menuAnchor,
      menuType,
      passwordDialogOpen,
      passwordDialogProps,
      snackbarOpen,
      snackbarMessage,
      usherDialogMode,
      usherDialogOpen,
      usherForm,
      userDialogMode,
      userDialogOpen,
      userForm,
    } = this.state;
    const {
      classes, items, sights, ushers,
    } = this.props;
    const selectedItem = this.getSelectedItem();
    const sortedList = [...(items || [])].sort((a, b) => (
      (a.email || '').localeCompare(b.email || '', 'pl', { sensitivity: 'base' })
    ));
    const sortedUshers = [...(ushers || [])].sort((a, b) => (
      (a.email || '').localeCompare(b.email || '', 'pl', { sensitivity: 'base' })
    ));
    const allowedSightIds = userForm.allowedSightIds || [];

    return (
      <Grid container className={classes.root}>
        <Grid container alignItems="center" justify="space-between" className={classes.toolbar}>
          <Grid item className={classes.buttonGroup}>
            <Button onClick={this.handleCreateUser}>
              <AddIcon className={classes.icon} />
              Dodaj użytkownika
            </Button>
            <Button onClick={this.handleCreateUsher}>
              <AddIcon className={classes.icon} />
              Dodaj biletera
            </Button>
          </Grid>
        </Grid>

        {sortedList.length === 0 && (
          <EmptyView
            image={LocalOfferIcon}
            label="Brak użytkowników"
            message="Dodaj użytkownika lub ponów zapytanie aby wyświetlić listę."
            onRefresh={this.handleFetchItems}
          />
        )}

        {sortedList.length > 0 && (
          <React.Fragment>
            <Table aria-labelledby="items-list">
              <TableHead columns={tableColumns} />
              <TableBody>
                {sortedList.map(item => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{this.getRoleLabel(item)}</TableCell>
                    <TableCell>{this.getAllowedSightsLabel(item)}</TableCell>
                    <TableCell>{item.blocked ? 'Nieaktywny' : 'Aktywny'}</TableCell>
                    <TableCell align="right" className={classes.actions}>
                      <IconButton
                        aria-owns={menuAnchor ? 'item-menu' : undefined}
                        aria-haspopup="true"
                        onClick={event => this.handleMenuOpen(event, item.id, 'user')}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Menu
              id="item-menu"
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor) && menuType === 'user'}
              onClose={this.handleMenuClose}
              onExited={this.handleMenuExited}
            >
              {this.isPanelUser(selectedItem) && (
                <MenuItem onClick={() => this.handleEditUser(selectedItem)}>
                  Edytuj
                </MenuItem>
              )}
              <MenuItem onClick={() => this.handlePasswordDialogOpen(selectedItem)}>
                Zmień hasło
              </MenuItem>
              {this.isPanelUser(selectedItem) && (
                <MenuItem onClick={() => this.handleBlockedChange(selectedItem)}>
                  {selectedItem && selectedItem.blocked ? 'Aktywuj' : 'Dezaktywuj'}
                </MenuItem>
              )}
              {this.isPanelUser(selectedItem) && (
                <MenuItem onClick={() => this.handleDeleteDialogOpen(selectedItem)}>
                  Usun
                </MenuItem>
              )}
            </Menu>
          </React.Fragment>
        )}

        <Grid item xs={12} className={classes.sectionTitle}>
          <strong>Bileterzy</strong>
        </Grid>

        {sortedUshers.length === 0 && (
          <EmptyView
            image={LocalOfferIcon}
            label="Brak bileterow"
            message="Dodaj biletera lub ponow zapytanie aby wyswietlic liste."
            onRefresh={this.handleFetchUshers}
          />
        )}

        {sortedUshers.length > 0 && (
          <React.Fragment>
            <Table aria-labelledby="ushers-list">
              <TableHead columns={usherTableColumns} />
              <TableBody>
                {sortedUshers.map(item => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.blocked ? 'Nieaktywny' : 'Aktywny'}</TableCell>
                    <TableCell align="right" className={classes.actions}>
                      <IconButton
                        aria-owns={menuAnchor ? 'usher-menu' : undefined}
                        aria-haspopup="true"
                        onClick={event => this.handleMenuOpen(event, item.id, 'usher')}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Menu
              id="usher-menu"
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor) && menuType === 'usher'}
              onClose={this.handleMenuClose}
              onExited={this.handleMenuExited}
            >
              <MenuItem onClick={() => this.handleEditUsher(selectedItem)}>
                Edytuj
              </MenuItem>
              <MenuItem onClick={() => this.handlePasswordDialogOpen(selectedItem)}>
                Zmien haslo
              </MenuItem>
              <MenuItem onClick={() => this.handleBlockedChange(selectedItem)}>
                {selectedItem && selectedItem.blocked ? 'Aktywuj' : 'Dezaktywuj'}
              </MenuItem>
              <MenuItem onClick={() => this.handleDeleteDialogOpen(selectedItem)}>
                Usun
              </MenuItem>
            </Menu>
          </React.Fragment>
        )}

        <Dialog
          open={userDialogOpen}
          onClose={this.handleUserDialogClose}
          aria-labelledby="partner-user-dialog-title"
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle id="partner-user-dialog-title">
            {userDialogMode === 'edit' ? 'Edytuj użytkownika partnera' : 'Dodaj użytkownika partnera'}
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <Grid container spacing={16}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Imię i nazwisko"
                  onChange={this.handleUserFormChange('name')}
                  value={userForm.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="E-mail"
                  onChange={this.handleUserFormChange('email')}
                  value={userForm.email}
                />
              </Grid>
              {userDialogMode === 'create' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Hasło"
                    onChange={this.handleUserFormChange('password')}
                    type="password"
                    value={userForm.password}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth className={classes.formControl}>
                  <InputLabel htmlFor="partner-user-role">Rola</InputLabel>
                  <Select
                    input={<Input id="partner-user-role" />}
                    onChange={this.handleUserRoleChange}
                    value={userForm.role}
                  >
                    <MenuItem value={ROLE_ADMIN}>Admin</MenuItem>
                    <MenuItem value={ROLE_SALESMAN}>Salesman</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  className={classes.formControl}
                  disabled={userForm.role !== ROLE_SALESMAN}
                >
                  <InputLabel htmlFor="partner-user-sights">Obiekty</InputLabel>
                  <Select
                    multiple
                    input={<Input id="partner-user-sights" />}
                    onChange={this.handleAllowedSightsChange}
                    renderValue={selected => (
                      selected.length
                        ? selected.map(id => this.getSightName(Number(id))).join(', ')
                        : 'Brak'
                    )}
                    value={allowedSightIds}
                  >
                    {(sights || []).map(sight => (
                      <MenuItem key={sight.id} value={sight.id}>
                        <Checkbox checked={allowedSightIds.includes(sight.id)} />
                        <ListItemText primary={sight.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleUserDialogClose} color="primary">
              Anuluj
            </Button>
            <Button onClick={this.handleUserDialogAccept} color="primary">
              Zapisz
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={usherDialogOpen}
          onClose={this.handleUsherDialogClose}
          aria-labelledby="partner-usher-dialog-title"
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle id="partner-usher-dialog-title">
            {usherDialogMode === 'edit' ? 'Edytuj biletera' : 'Dodaj biletera'}
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <Grid container spacing={16}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Imie i nazwisko"
                  onChange={this.handleUsherFormChange('name')}
                  value={usherForm.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="E-mail"
                  onChange={this.handleUsherFormChange('email')}
                  value={usherForm.email}
                />
              </Grid>
              {usherDialogMode === 'create' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Haslo"
                    onChange={this.handleUsherFormChange('password')}
                    type="password"
                    value={usherForm.password}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleUsherDialogClose} color="primary">
              Anuluj
            </Button>
            <Button onClick={this.handleUsherDialogAccept} color="primary">
              Zapisz
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={passwordDialogOpen}
          onClose={this.handlePasswordDialogClose}
          aria-labelledby="password-dialog-title"
          aria-describedby="password-dialog-description"
        >
          <DialogTitle id="password-dialog-title">
            Zmiana hasła użytkownika partnera
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="password-dialog-description">
              {`Zmieniasz hasło użytkownikowi o adresie e-mail "${passwordDialogProps.name}":`}
            </DialogContentText>
            <TextField
              fullWidth
              label="Nowe hasło"
              onChange={this.handlePasswordChange}
              type="password"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handlePasswordDialogClose} color="primary">
              Anuluj
            </Button>
            <Button onClick={this.handlePasswordDialogAccept} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteDialogOpen}
          onClose={this.handleDeleteDialogClose}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">
            Usunięcie użytkownika
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              {`Czy na pewno chcesz usunąć użytkownika o adresie e-mail "${deleteDialogProps.name}"?`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDeleteDialogClose} color="primary">
              Anuluj
            </Button>
            <Button onClick={this.handleDeleteAccept} color="secondary">
              Usuń
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={snackbarOpen}
          onClose={this.handleSnackbarClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={snackbarMessage}
        />
      </Grid>
    );
  }
}

PartnerUsersList.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  error: PropTypes.shape({}),
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onCreateUsher: PropTypes.func.isRequired,
  onCreateUser: PropTypes.func.isRequired,
  onDeleteItem: PropTypes.func.isRequired,
  onDeleteUsher: PropTypes.func.isRequired,
  onFetchItems: PropTypes.func.isRequired,
  onFetchSights: PropTypes.func.isRequired,
  onFetchUshers: PropTypes.func.isRequired,
  onPasswordChange: PropTypes.func.isRequired,
  onSetUserBlocked: PropTypes.func.isRequired,
  onSetUsherBlocked: PropTypes.func.isRequired,
  onUpdateUsher: PropTypes.func.isRequired,
  onUsherPasswordChange: PropTypes.func.isRequired,
  onUpdateUser: PropTypes.func.isRequired,
  partnerId: PropTypes.number.isRequired,
  sights: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  ushers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

PartnerUsersList.defaultProps = {
  error: null,
};

export default compose(
  withAuth(),
  withStyles(styles),
)(PartnerUsersList);
