import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import EmptyView from 'components/EmptyView';
import TableHead from 'components/Table/TableHead';
import withAuth from 'services/auth/withAuth';

const tableColumns = [
  { id: 'email', label: 'E-mail' },
  { id: 'menu', label: '' },
];

const styles = theme => ({
  root: {
    minHeight: '100%',
  },
  actions: {
    minWidth: 150,
  },
  paper: {
    flex: 1,
    overflow: 'hidden',
  },
  toolbar: {
    padding: theme.spacing.unit,
  },
});

class PartnerUsersList extends React.Component {
  state = {
    dialogOpen: false,
    dialogProps: {},
    deleteDialogOpen: false,
    deleteDialogProps: {},
    isFetching: false,
    menuAnchor: null,
    menuItemId: null,
    menuItemName: '',
    snackbarOpen: false,
    snackbarMessage: '',
  };

  handleDialogAccept = () => {
    const { dialogProps } = this.state;
    const { onPasswordChange } = this.props;
    const { itemId, password } = dialogProps || {};

    if (itemId && password && onPasswordChange) {
      onPasswordChange(itemId, password);
    }

    this.handleDialogClose();
  };

  handleDialogClose = () => this.setState({ dialogOpen: false });

  handleDialogExited = () => this.setState({ dialogProps: {} });

  handleDialogOpen = (dialogProps) => {
    this.setState({ dialogOpen: true, dialogProps });
    this.handleMenuClose();
  };

  handleDeleteDialogOpen = (deleteDialogProps) => {
    this.setState({ deleteDialogOpen: true, deleteDialogProps });
    this.handleMenuClose();
  };

  handleDeleteDialogClose = () => this.setState({ deleteDialogOpen: false });

  handleDeleteDialogExited = () => this.setState({ deleteDialogProps: {} });

  handleDeleteAccept = () => {
    const { deleteDialogProps } = this.state;
    const { onDeleteItem } = this.props;
    const { itemId } = deleteDialogProps || {};

    if (itemId && onDeleteItem) {
      onDeleteItem(itemId);
    }

    this.handleDeleteDialogClose();
  };

  handleFetchItems = () => {
    const { onFetchItems } = this.props;

    if (onFetchItems) {
      onFetchItems();
    }
  };

  handleItemPasswordChange = (event) => {
    const { value: password } = event.target || {};

    this.setState(state => ({
      ...state,
      dialogProps: {
        ...state.dialogProps,
        password,
      },
    }));
  };

  handleMenuOpen = (event, itemId, itemName) =>
    this.setState({
      menuAnchor: event.currentTarget,
      menuItemId: itemId,
      menuItemName: itemName,
    });

  handleMenuClose = () => this.setState({ menuAnchor: null });

  handleMenuExited = () => this.setState({ menuItemId: null, menuItemName: '' });

  handleSnackbarOpen = message =>
    this.setState({
      snackbarOpen: true,
      snackbarMessage: typeof message === 'string' ? message : 'Wystąpił nieznany błąd.',
    });

  handleSnackbarClose = () =>
    this.setState({
      snackbarOpen: false,
      snackbarMessage: '',
    });

  render() {
    const {
      dialogOpen,
      dialogProps,
      deleteDialogOpen,
      deleteDialogProps,
      isFetching,
      menuAnchor,
      menuItemId,
      menuItemName,
      snackbarOpen,
      snackbarMessage,
    } = this.state;
    const { classes, items: sortedList } = this.props;

    return (
      <Grid container className={classes.root}>
        <React.Fragment>
          {sortedList.length === 0 && (
            <EmptyView
              image={LocalOfferIcon}
              label="Brak produktów"
              loading={isFetching}
              message="Dodaj użytkownika lub ponów zapytanie aby wyświetlić listę."
              onRefresh={this.handleFetchItems}
            />
          )}

          {sortedList.length > 0 && (
            <React.Fragment>
              <Table aria-labelledby="items-list">
                <TableHead columns={tableColumns} />
                <TableBody>
                  {sortedList.map(({ id: listItemId, email }) => (
                    <TableRow key={listItemId} hover>
                      <TableCell>{email}</TableCell>
                      <TableCell align="right" className={classes.actions}>
                        <IconButton
                          aria-owns={menuAnchor ? 'item-menu' : undefined}
                          aria-haspopup="true"
                          onClick={event => this.handleMenuOpen(event, listItemId, email)}
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
                open={Boolean(menuAnchor)}
                onClose={this.handleMenuClose}
                onExited={this.handleMenuExited}
              >
                <MenuItem
                  onClick={() =>
                    this.handleDialogOpen({ itemId: menuItemId, name: menuItemName })
                  }
                >
                  Zmień hasło
                </MenuItem>

                <MenuItem
                  onClick={() =>
                    this.handleDeleteDialogOpen({
                      itemId: menuItemId,
                      name: menuItemName,
                    })
                  }
                >
                  Usuń pracownika
                </MenuItem>
              </Menu>

              <Dialog
                open={dialogOpen}
                onClose={this.handleDialogClose}
                onExited={this.handleDialogExited}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  Zmiana hasła użytkownika partnera
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    {`Zmieniasz hasło użytkownikowi o adresie e-mail "${dialogProps.name}":`}
                  </DialogContentText>
                  <TextField
                    fullWidth
                    label="Nowe hasło"
                    onChange={this.handleItemPasswordChange}
                    type="password"
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleDialogClose} color="primary">
                    Anuluj
                  </Button>
                  <Button onClick={this.handleDialogAccept} color="primary">
                    OK
                  </Button>
                </DialogActions>
              </Dialog>

              <Dialog
                open={deleteDialogOpen}
                onClose={this.handleDeleteDialogClose}
                onExited={this.handleDeleteDialogExited}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
              >
                <DialogTitle id="delete-dialog-title">
                  Usunięcie użytkownika partnera
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
            </React.Fragment>
          )}
        </React.Fragment>

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
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onDeleteItem: PropTypes.func.isRequired,
  onFetchItems: PropTypes.func.isRequired,
  onPasswordChange: PropTypes.func.isRequired,
};

export default compose(
  withAuth(),
  withStyles(styles),
)(PartnerUsersList);
