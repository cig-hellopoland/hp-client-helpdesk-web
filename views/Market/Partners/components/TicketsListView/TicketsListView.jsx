import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
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
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { withRouter } from 'next/router';

import { DEFAULT_LANGUAGE } from 'utils/translations';
import EmptyView from 'components/EmptyView';
import formatPrice from 'utils/formatPrice';
import TableHead from 'components/Table/TableHead';
import withAuth from 'services/auth/withAuth';
import {
  actions as ticketDefinitionsActions,
  selectors as ticketDefinitionsSelectors,
} from 'redux/ticketDefinitions';
import Button from '@material-ui/core/Button';

const tableColumns = [
  { id: 'name', label: 'Nazwa produktu' },
  { id: 'ticketType', label: 'Typ biletu' },
  { id: 'price', label: 'Cena' },
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

class TicketsListView extends React.Component {
  baseURL = '/market/tickets';

  state = {
    dialogOpen: false,
    dialogProps: {},
    isFetching: false,
    menuAnchor: null,
    menuItemId: null,
    menuItemName: '',
    snackbarOpen: false,
    snackbarMessage: '',
  };

  componentDidMount() {
    this.handleFetchItems();
  }

  handleDialogAccept = () => {
    const { dialogProps } = this.state;
    const { itemId } = dialogProps || {};

    if (itemId) {
      this.handleItemDelete(itemId);
    }

    this.handleDialogClose();
  };

  handleDialogClose = () => this.setState({ dialogOpen: false });

  handleDialogExited = () => this.setState({ dialogProps: {} });

  handleDialogOpen = (dialogProps) => {
    this.setState({ dialogOpen: true, dialogProps });
    this.handleMenuClose();
  };

  handleFetchItems = () => {
    const { fetchList, partnerId } = this.props;

    if (fetchList) {
      fetchList({
        partnerId,
        options: {
          headers: {
            'Content-Language': DEFAULT_LANGUAGE,
          },
        },
        onFailure: this.handleFetchItemsFailure,
        onSuccess: this.handleFetchItemsSuccess,
      });

      this.setState({ isFetching: true });
    }
  };

  handleFetchItemsFailure = () => this.setState({ isFetching: false });

  handleFetchItemsSuccess = () => this.setState({ isFetching: false });

  handleItemDelete = (itemId) => {
    const { deleteItem } = this.props;

    if (deleteItem) {
      deleteItem({
        id: itemId,
        onFailure: this.handleItemDeleteFailure,
        onSuccess: () => this.handleFetchItems(),
      });
    }

    this.handleMenuClose();
  };

  handleItemDeleteFailure = () => {
    const { clearError, error } = this.props;

    if (error) {
      const { data: errorData } = error;

      this.handleSnackbarOpen(errorData && errorData.message);

      if (clearError) {
        clearError();
      }
    }
  };

  handleItemEdit = (itemId) => {
    const { partnerId, router } = this.props;

    const href = `${this.baseURL}/edit?itemId=${itemId}&partnerId=${partnerId}`;
    const pathname = `${this.baseURL}/${itemId}/edit?partnerId=${partnerId}`;

    router.push(href, pathname);

    this.handleMenuClose();
  };

  handleMenuOpen = (event, itemId, itemName) => this.setState({
    menuAnchor: event.currentTarget,
    menuItemId: itemId,
    menuItemName: itemName,
  });

  handleMenuClose = () => this.setState({ menuAnchor: null });

  handleMenuExited = () => this.setState({ menuItemId: null, menuItemName: '' });

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
      dialogOpen, dialogProps, isFetching, menuAnchor, menuItemId, menuItemName, snackbarOpen,
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
              message="Dodaj produkt lub ponów zapytanie aby wyświetlić listę."
              onRefresh={this.handleFetchItems}
            />
          )}
          {sortedList.length > 0 && (
            <React.Fragment>
              <Table aria-labelledby="items-list">
                <TableHead columns={tableColumns} />
                <TableBody>
                  {
                    sortedList.map(({
                      id: listItemId, name, price, ticketType,
                    }) => (
                      <TableRow key={listItemId} hover>
                        <TableCell>{name}</TableCell>
                        <TableCell>{ticketType ? ticketType.label : '-'}</TableCell>
                        <TableCell>{formatPrice(price)}</TableCell>
                        <TableCell align="right" className={classes.actions}>
                          <IconButton
                            aria-owns={menuAnchor ? 'item-menu' : undefined}
                            aria-haspopup="true"
                            onClick={event => this.handleMenuOpen(event, listItemId, name)}
                          >
                            <MoreVertIcon />
                          </IconButton>

                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
              <Menu
                id="item-menu"
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={this.handleMenuClose}
                onExited={this.handleMenuExited}
              >
                <MenuItem onClick={() => this.handleItemEdit(menuItemId)}>
                  Edytuj
                </MenuItem>
                <MenuItem
                  onClick={() => this.handleDialogOpen({ itemId: menuItemId, name: menuItemName })}
                >
                  Usuń
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
                  Usuń produkt
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    {`Czy na pewno usunąć produkt "${dialogProps.name}"?`}
                  </DialogContentText>
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

TicketsListView.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  clearError: PropTypes.func.isRequired,
  deleteItem: PropTypes.func.isRequired,
  error: PropTypes.shape({}),
  fetchList: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  partnerId: PropTypes.number.isRequired,
  router: PropTypes.shape({}).isRequired,
};

TicketsListView.defaultProps = {
  error: null,
};

const mapStateToProps = state => ({
  error: ticketDefinitionsSelectors.getError(state),
  items: ticketDefinitionsSelectors.getTicketDefinitions(state),
});

const mapDispatchToProps = {
  clearError: ticketDefinitionsActions.clearError,
  deleteItem: ticketDefinitionsActions.deleteItem,
  fetchList: ticketDefinitionsActions.fetchList,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withRouter,
  withStyles(styles),
)(TicketsListView);
