import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import LockIcon from '@material-ui/icons/Lock';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PlaceIcon from '@material-ui/icons/Place';
import PublicIcon from '@material-ui/icons/Public';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import Typography from '@material-ui/core/Typography';

import { withRouter } from 'next/router';
import {
  actions as sightsActions,
  selectors as sightsSelectors,
} from '@hello-poland/commons/redux/sights';
import withAuth from 'services/auth/withAuth';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import Layout from 'components/Layout';
import EmptyView from 'components/EmptyView';
import SortableTableHead from '../Partners/components/ListingViewTable/SortableTableHead';


const tableColumns = [
  { id: 'item-id', label: '# ID', sortable: true },
  { id: 'name', label: 'Nazwa obiektu', sortable: true },
  { id: 'location', label: 'Lokalizacja', sortable: true },
  { id: 'partner', label: 'Partner', sortable: true },
  { id: 'details', label: '', sortable: false },
];



const styles = theme => ({
  root: {
    minHeight: '100%',
  },
  actions: {
    minWidth: 200,
  },
  orderNunber: {
    minWidth: 110,
  },
  paper: {
    flex: 1,
  },
  toolbar: {
    padding: theme.spacing.unit,
  },
});

class SightsList extends React.Component {
  baseURL = '/market/sights';

  state = {
    dialogOpen: false,
    dialogProps: {},
    isFetching: false,
    menuAnchor: null,
    menuItemId: null,
    snackbarOpen: false,
    snackbarMessage: '',
    order: 'asc',
    orderBy: 'item-id',
    filterText: '',

  };

  componentDidMount() {
    this.handleFetchItems();
  }

  getItemById = (itemId) => {
    const { items } = this.props;

    return items.find(item => item.id === itemId);
  };

  handleBlockItem = (itemId) => {
    const item = this.getItemById(itemId);

    if (item) {
      const { blocked } = item;

      this.handleUpdateItem(itemId, { ...item, blocked: !blocked });
    }

    this.handleMenuClose();
  };

  handleDialogOpen = () => {
    const { menuItemId } = this.state;
    const { items } = this.props;

    const selectedItem = items.find(item => item.id === menuItemId);

    if (selectedItem) {
      this.setState({
        dialogOpen: true,
        dialogProps: {
          itemId: menuItemId,
          name: selectedItem.name,
        },
      });
    }

    this.handleMenuClose();
  };

  handleDialogClose = () => this.setState({
    dialogOpen: false,
    dialogProps: {},
  });

  handleDeleteItemFailure = () => {
    const { error } = this.props;

    this.handleDialogClose();
    this.handleSnackbarOpen(error && error.message);
  };

  handleDeleteItemSuccess = () => {
    this.handleDialogClose();
    this.handleFetchItems();
  };

  handleDeleteItem = (itemId) => {
    const { deleteItem } = this.props;

    this.setState(state => ({
      ...state,
      dialogProps: {
        ...state.dialogProps,
        deleting: true,
      },
    }));

    deleteItem({
      id: itemId,
      onFailure: this.handleDeleteItemFailure,
      onSuccess: this.handleDeleteItemSuccess,
    });
  };

  handleFetchItemsFailure = () => this.setState({ isFetching: false });

  handleFetchItemsSuccess = () => this.setState({ isFetching: false });

  handleFetchItems = () => {
    const { fetchList } = this.props;

    fetchList({
      options: {
        headers: {
          'Content-Language': DEFAULT_LANGUAGE,
        },
      },
      onFailure: this.handleFetchItemsFailure,
      onSuccess: this.handleFetchItemsSuccess,
    });

    this.setState({ isFetching: true });
  };

  handleItemEdit = (itemId) => {
    const { router } = this.props;

    const href = `${this.baseURL}/edit?itemId=${itemId}`;
    const pathname = `${this.baseURL}/${itemId}/edit`;

    router.push(href, pathname);

    this.handleMenuClose();
  };

  handleMenuOpen = (event, itemId) => this.setState({
    menuAnchor: event.currentTarget,
    menuItemId: itemId,
  });

  handleMenuClose = () => this.setState({ menuAnchor: null });

  handleMenuExited = () => this.setState({ menuItemId: null });

  handlePublishItem = (itemId) => {
    const item = this.getItemById(itemId);

    if (item) {
      const { published } = item;
      this.handleUpdateItem(itemId, { ...item, published: !published });
    }

    this.handleMenuClose();
  };

  handleSnackbarOpen = message => this.setState({
    snackbarOpen: true,
    snackbarMessage: typeof message === 'string' ? message : 'Wystąpił nieznany błąd.',
  });

  handleSnackbarClose = () => this.setState({
    snackbarOpen: false,
    snackbarMessage: '',
  });

  handleUpdateItemFailure = () => {
    const { error } = this.props;

    this.handleSnackbarOpen(error && error.message);
  };

  handleUpdateItemSuccess = () => this.handleFetchItems();

  handleUpdateItem = (itemId, data) => {
    const { updateItem } = this.props;
    const item = this.getItemById(itemId);

    if (item) {
      const { defaultLanguage } = item;
      updateItem({
        id: itemId,
        data,
        pathParams: {
          languageVersion: defaultLanguage,
        },
        onFailure: this.handleUpdateItemFailure,
        onSuccess: this.handleUpdateItemSuccess,
        options: {
          headers: {
            'Content-Language': defaultLanguage,
          },
        },
      });
    }
  };


  handleRequestSort = (event, property) => {
    this.setState((prevState) => {
      const isSameField = prevState.orderBy === property;
      const isAsc = prevState.order === 'asc';

      return {
        ...prevState,
        order: isSameField && isAsc ? 'desc' : 'asc',
        orderBy: property,
      };
    });
  };

handleFilterChange = (event) => {
    this.setState({
      filterText: event.target.value,
    });
  };


  isItemBlocked = (itemId) => {
    const { items } = this.props;
    const selectedItem = items && items.find(item => item.id === itemId);

    if (selectedItem) {
      return !!selectedItem.blocked;
    }

    return false;
  };

  isItemPublished = (itemId) => {
    const { items } = this.props;
    const selectedItem = items && items.find(item => item.id === itemId);

    if (selectedItem) {
      return !!selectedItem.published;
    }

    return false;
  };

  render() {
    const {
      dialogOpen, dialogProps, isFetching, menuAnchor, menuItemId, snackbarMessage,
      snackbarOpen,
    } = this.state;
    const { classes, items } = this.props;
    const { order, orderBy, filterText } = this.state;

    const baseList = items || [];
    const hasItems = baseList.length > 0;

    // 1. filtrowanie po nazwie / mieście / partnerze
    const query = (filterText || '').toLowerCase();
    const filteredList = baseList.filter((item) => {
      if (!query) return true;

      const name = (item.name || '').toLowerCase();
      const city = (item.location && item.location.city || '').toLowerCase();
      const partner = (item.partnerName || '').toLowerCase();

      return (
        name.includes(query)
        || city.includes(query)
        || partner.includes(query)
      );
    });

    // 2. sortowanie
    const sortedList = [...filteredList].sort((a, b) => {
      let aValue;
      let bValue;

      switch (orderBy) {
        case 'item-id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'location':
          aValue = (a.location && a.location.city) || '';
          bValue = (b.location && b.location.city) || '';
          break;
        case 'partner':
          aValue = a.partnerName || '';
          bValue = b.partnerName || '';
          break;
        case 'name':
        default:
          aValue = a.name || '';
          bValue = b.name || '';
          break;
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
    const colorActive = 'primary';
    const colorInactive = 'disabled';


    return (
      <Layout>
        <Grid container className={classes.root}>
          <Paper className={classes.paper}>
           {/* 1) Brak jakichkolwiek obiektów w systemie */}
           {!hasItems && !isFetching && (
             <EmptyView
               image={PlaceIcon}
               label="Brak obiektu"
               loading={isFetching}
               message="Ponów zapytanie aby wyświetlić listę."
               onRefresh={this.handleFetchItems}
             />
           )}

           {/* 2) Mamy jakieś obiekty – pokazujemy filtr + tabelę / informację o braku wyników */}
           {hasItems && (
             <React.Fragment>
               {/* Pasek filtrowania zawsze widoczny, gdy są jakieś obiekty */}
               <Grid container justify="flex-end" className={classes.toolbar}>
                 <Grid item xs={12} sm={6} md={4}>
                   <TextField
                     fullWidth
                     label="Filtruj (nazwa, lokalizacja, partner)"
                     value={filterText}
                     onChange={this.handleFilterChange}
                     InputProps={{
                       endAdornment: (
                         <InputAdornment position="end">
                           <SearchIcon />
                         </InputAdornment>
                       ),
                     }}
                   />
                 </Grid>
               </Grid>

               {/* Jeśli filtr nic nie znalazł – nie pokazujemy EmptyView, tylko komunikat */}
               {sortedList.length === 0 ? (
                 <Grid container justify="center" style={{ padding: 16 }}>
                   <Typography variant="subtitle1">
                     Brak wyników dla filtra: "{filterText}"
                   </Typography>
                 </Grid>
               ) : (
                 <Table aria-labelledby="items-list">
                   <SortableTableHead
                     columns={tableColumns}
                     order={order}
                     orderBy={orderBy}
                     onRequestSort={this.handleRequestSort}
                   />
                   <TableBody>
                     {sortedList.map(({
                       blocked, id: itemId, location, name, partnerName, published,
                     }) => (
                       <TableRow key={itemId} hover>
                         <TableCell className={classes.orderNunber}>{itemId}</TableCell>
                         <TableCell>{name}</TableCell>
                         <TableCell>{location.city}</TableCell>
                         <TableCell>{partnerName}</TableCell>
                         <TableCell align="right" className={classes.actions}>
                           <IconButton disabled>
                             <LockIcon color={blocked ? colorActive : colorInactive} />
                           </IconButton>
                           <IconButton disabled>
                             <PublicIcon color={published ? colorActive : colorInactive} />
                           </IconButton>
                           <IconButton
                             aria-owns={menuAnchor ? 'item-menu' : undefined}
                             aria-haspopup="true"
                             onClick={event => this.handleMenuOpen(event, itemId)}
                           >
                             <MoreVertIcon />
                           </IconButton>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               )}

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
                 <MenuItem onClick={() => this.handleBlockItem(menuItemId)}>
                   {this.isItemBlocked(menuItemId) ? 'Odblokuj' : 'Zablokuj'}
                 </MenuItem>
                 <MenuItem onClick={() => this.handlePublishItem(menuItemId)}>
                   {this.isItemPublished(menuItemId) ? 'Odpublikuj' : 'Opublikuj'}
                 </MenuItem>
                 <MenuItem onClick={this.handleDialogOpen}>
                   Usuń
                 </MenuItem>
               </Menu>

               <Dialog
                 open={dialogOpen}
                 onClose={this.handleDialogClose}
                 aria-labelledby="alert-dialog-title"
                 aria-describedby="alert-dialog-description"
               >
                 {/* bez zmian */}
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
             </React.Fragment>
           )}

          </Paper>
        </Grid>
      </Layout>
    );
  }
}

SightsList.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  deleteItem: PropTypes.func.isRequired,
  error: PropTypes.shape({}),
  fetchList: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  router: PropTypes.shape({}).isRequired,
  updateItem: PropTypes.func.isRequired,
};

SightsList.defaultProps = {
  error: null,
};

const mapStateToProps = state => ({
  error: sightsSelectors.getError(state),
  items: sightsSelectors.getSights(state),
});

const mapDispatchToProps = {
  deleteItem: sightsActions.deleteItem,
  fetchList: sightsActions.fetchList,
  updateItem: sightsActions.updateItem,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withRouter,
  withStyles(styles),
)(SightsList);
