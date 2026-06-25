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
import AddIcon from '@material-ui/icons/Add';
import CategoryIcon from '@material-ui/icons/Category';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import LockIcon from '@material-ui/icons/Lock';
import StarIcon from '@material-ui/icons/Star';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import Typography from '@material-ui/core/Typography';
import Link from 'next/link';
import { withRouter } from 'next/router';
import {
  actions as categoriesActions,
  selectors as categoriesSelectors,
} from '@hello-poland/commons/redux/categories';
import {
  actions as categoriesOrderActions,
  selectors as categoriesOrderSelectors,
} from 'redux/categoriesOrder';
import withAuth from 'services/auth/withAuth';
import { DEFAULT_LANGUAGE } from 'utils/translations';

import Layout from 'components/Layout';
import EmptyView from 'components/EmptyView';
import SortableTableHead from '../Partners/components/ListingViewTable/SortableTableHead';

const tableColumns = [
  { id: 'icon', label: 'Ikona', sortable: true  },
  { id: 'displayOrder', label: 'Kolejność', sortable: true  },
  { id: 'name', label: 'Nazwa kategorii', sortable: true  },
  { id: 'count', label: 'Liczba ofert', sortable: true  },
  { id: 'details', label: '', sortable: false  },
];

const styles = theme => ({
  root: {
    minHeight: '100%',
  },
  icon: {
    marginRight: theme.spacing.unit,
  },
  iconCell: {
    width: 50,
  },
  paper: {
    flex: 1,
    overflow: 'hidden',
  },
  toolbar: {
    padding: theme.spacing.unit,
  },
  orderDialogContent: {
    maxWidth: '100%',
    width: 480,
  },
  orderItem: {
    alignItems: 'center',
    borderBottom: '1px solid #e0e0e0',
    cursor: 'move',
    display: 'flex',
    minHeight: 56,
    padding: `${theme.spacing.unit}px 0`,
  },
  orderItemIndex: {
    color: theme.palette.text.secondary,
    width: 48,
  },
  orderItemIcon: {
    width: 64,
  },
  orderItemName: {
    flex: 1,
  },
  orderItemHandle: {
    color: theme.palette.text.secondary,
    paddingRight: theme.spacing.unit,
  },
  orderDropZone: {
    color: theme.palette.text.secondary,
    padding: `${theme.spacing.unit * 2}px 0`,
    textAlign: 'center',
  },
});

class CategoriesList extends React.Component {
  baseURL = '/market/categories';

  state = {
    dialogOpen: false,
    dialogProps: {},
    isFetching: false,
    menuAnchor: null,
    menuItemId: null,
    snackbarOpen: false,
    snackbarMessage: '',
    order: 'asc',
    orderBy: 'displayOrder',
    filterText: '',
    orderDialogOpen: false,
    orderItems: [],
    draggedOrderItemId: null,
  };

  componentDidMount() {
    this.handleFetchItems();
  }

  handleDialogOpen = () => {
    const { menuItemId } = this.state;
    const { items } = this.props;

    const selectedItem = items.find(item => item.id === menuItemId);

    if (selectedItem) {
      this.setState({
        dialogOpen: true,
        dialogProps: {
          itemId: menuItemId,
          itemName: selectedItem.label,
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

  handleItemEdit = () => {
    const { menuItemId } = this.state;
    const { router } = this.props;

    const href = `${this.baseURL}/edit?itemId=${menuItemId}`;
    const pathname = `${this.baseURL}/${menuItemId}/edit`;

    router.push(href, pathname);

    this.handleMenuClose();
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

  getPortalOrderedItems = () => {
    const { items } = this.props;

    return [...(items || [])].sort((a, b) => {
      const aValue = a.displayOrder || Number.MAX_SAFE_INTEGER;
      const bValue = b.displayOrder || Number.MAX_SAFE_INTEGER;

      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      if (a.id < b.id) return 1;
      if (a.id > b.id) return -1;
      return 0;
    });
  };

  handleOrderDialogOpen = () => this.setState({
    orderDialogOpen: true,
    orderItems: this.getPortalOrderedItems(),
  });

  handleOrderDialogClose = () => this.setState({
    orderDialogOpen: false,
    orderItems: [],
    draggedOrderItemId: null,
  });

  handleOrderDragStart = itemId => (event) => {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(itemId));
    }

    this.setState({ draggedOrderItemId: itemId });
  };

  handleOrderDragOver = (event) => {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  };

  handleOrderDrop = targetItemId => (event) => {
    event.preventDefault();

    this.setState((state) => {
      const draggedItemId = state.draggedOrderItemId;

      if (!draggedItemId || draggedItemId === targetItemId) {
        return { draggedOrderItemId: null };
      }

      const nextItems = [...state.orderItems];
      const draggedIndex = nextItems.findIndex(item => item.id === draggedItemId);

      if (draggedIndex === -1) {
        return { draggedOrderItemId: null };
      }

      const [draggedItem] = nextItems.splice(draggedIndex, 1);
      const targetIndex = targetItemId === null
        ? nextItems.length
        : nextItems.findIndex(item => item.id === targetItemId);

      if (targetIndex === -1) {
        return { draggedOrderItemId: null };
      }

      nextItems.splice(targetIndex, 0, draggedItem);

      return {
        draggedOrderItemId: null,
        orderItems: nextItems,
      };
    });
  };

  handleOrderSaveFailure = errorData => {
    this.handleSnackbarOpen(errorData && errorData.message);
  };

  handleOrderSaveSuccess = () => {
    this.handleOrderDialogClose();
    this.handleSnackbarOpen('Kolejność została zapisana.');
    this.handleFetchItems();
  };

  handleOrderSave = () => {
    const { orderItems } = this.state;
    const { saveOrder } = this.props;

    saveOrder({
      data: orderItems.map(item => item.id),
      onFailure: this.handleOrderSaveFailure,
      onSuccess: this.handleOrderSaveSuccess,
    });
  };


  handleMenuOpen = (event, itemId) => this.setState({
    menuAnchor: event.currentTarget,
    menuItemId: itemId,
  });

  handleMenuClose = () => this.setState({
    menuAnchor: null,
    menuItemId: null,
  });

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
      dialogOpen, dialogProps, isFetching, menuAnchor, snackbarMessage, snackbarOpen,
      order, orderBy, filterText, orderDialogOpen, orderItems,
    } = this.state;
    const { classes, items, orderSaving } = this.props;
    const baseList = items || [];
    const hasItems = baseList.length > 0;

// filtr tekstowy
    const query = (filterText || '').toLowerCase();

    const filteredList = baseList.filter((item) => {
      if (!query) return true;

      const name = (item.label || '').toLowerCase();

      return name.includes(query);
    });

    // sortowanie
    const sortedList = [...filteredList].sort((a, b) => {
      let aValue;
      let bValue;

      switch (orderBy) {
        case 'icon':
          aValue = a.iconUrl || '';
          bValue = b.iconUrl || '';
          break;
        case 'count':
          aValue = a.assignedItemsCount || 0;
          bValue = b.assignedItemsCount || 0;
          break;
        case 'displayOrder':
          aValue = a.displayOrder || Number.MAX_SAFE_INTEGER;
          bValue = b.displayOrder || Number.MAX_SAFE_INTEGER;
          break;
        case 'name':
        default:
          aValue = a.label || '';
          bValue = b.label || '';
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
            <Grid container direction="column" className={classes.toolbar}>
              <Grid container item justify="flex-end">
                <Grid item>
                  <Button onClick={this.handleOrderDialogOpen}>
                    Ustal kolejność
                  </Button>
                </Grid>
                <Grid item>
                  <Link href={`${this.baseURL}/create`} passHref>
                    <Button component="a">
                      <AddIcon className={classes.icon} />
                      Dodaj
                    </Button>
                  </Link>
                </Grid>
              </Grid>
            </Grid>
            <Grid container justify="flex-end" className={classes.toolbar}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Filtruj (nazwa kategorii)"
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

            {!hasItems && (
              <EmptyView
                image={CategoryIcon}
                label="Brak kategorii"
                loading={isFetching}
                message="Dodaj kategorię lub ponów zapytanie aby wyświetlić listę."
                onRefresh={this.handleFetchItems}
              />
            )}

            {hasItems && (
              <React.Fragment>

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
                        assignedItemsCount, displayOrder, label, iconUrl, id, restricted, recommended,
                      }) => (
                        <TableRow key={id} hover>
                          <TableCell className={classes.iconCell} align="center">
                            {iconUrl
                              ? <img src={iconUrl} height={48} width={48} alt={label} />
                              : <ErrorOutlineIcon color="error" />
                            }
                          </TableCell>

                          <TableCell><Typography>{displayOrder}</Typography></TableCell>
                          <TableCell><Typography>{label}</Typography></TableCell>
                          <TableCell><Typography>{assignedItemsCount}</Typography></TableCell>

                          <TableCell align="right">
                            <IconButton disabled><LockIcon color={restricted ? 'primary' : 'disabled'} /></IconButton>
                            <IconButton disabled><StarIcon color={recommended ? 'primary' : 'disabled'} /></IconButton>
                            <IconButton onClick={event => this.handleMenuOpen(event, id)}>
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
                  >
                    <MenuItem onClick={this.handleItemEdit}>
                      Edytuj
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
                    <DialogTitle id="alert-dialog-title">
                      Usuń element
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText id="alert-dialog-description">
                        {`Czy napewno usunąć element "${dialogProps.itemName}"?`}
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={this.handleDialogClose} color="primary" disabled={dialogProps.deleting}>
                        Anuluj
                      </Button>
                      <Button onClick={() => this.handleDeleteItem(dialogProps.itemId)} color="primary" disabled={dialogProps.deleting}>
                        OK
                      </Button>
                    </DialogActions>
                  </Dialog>
                  <Dialog
                    open={orderDialogOpen}
                    onClose={this.handleOrderDialogClose}
                    aria-labelledby="order-dialog-title"
                  >
                    <DialogTitle id="order-dialog-title">
                      Ustal kolejność kategorii
                    </DialogTitle>
                    <DialogContent className={classes.orderDialogContent}>
                      {orderItems.map((item, index) => (
                        <div
                          key={item.id}
                          className={classes.orderItem}
                          draggable
                          onDragStart={this.handleOrderDragStart(item.id)}
                          onDragOver={this.handleOrderDragOver}
                          onDrop={this.handleOrderDrop(item.id)}
                        >
                          <Typography className={classes.orderItemIndex}>
                            {index + 1}
                          </Typography>
                          <div className={classes.orderItemIcon}>
                            {item.iconUrl
                              ? <img src={item.iconUrl} height={32} width={32} alt={item.label} />
                              : <ErrorOutlineIcon color="error" />
                            }
                          </div>
                          <Typography className={classes.orderItemName}>
                            {item.label}
                          </Typography>
                          <Typography className={classes.orderItemHandle}>
                            ::
                          </Typography>
                        </div>
                      ))}
                      <div
                        className={classes.orderDropZone}
                        onDragOver={this.handleOrderDragOver}
                        onDrop={this.handleOrderDrop(null)}
                      >
                        Upuść na koniec listy
                      </div>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={this.handleOrderDialogClose} color="primary" disabled={orderSaving}>
                        Anuluj
                      </Button>
                      <Button onClick={this.handleOrderSave} color="primary" disabled={orderSaving}>
                        Zapisz
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

              </React.Fragment>
            )}
          </Paper>
        </Grid>
      </Layout>
    );
  }
}

CategoriesList.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  deleteItem: PropTypes.func.isRequired,
  error: PropTypes.shape({}),
  fetchList: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    assignedItemsCount: PropTypes.number,
    displayOrder: PropTypes.number,
    iconUrl: PropTypes.string,
    id: PropTypes.number,
    label: PropTypes.string,
    restricted: PropTypes.bool,
    recommended: PropTypes.bool,
  })).isRequired,
  orderSaving: PropTypes.bool.isRequired,
  router: PropTypes.shape({}).isRequired,
  saveOrder: PropTypes.func.isRequired,
};

CategoriesList.defaultProps = {
  error: null,
};

const mapStateToProps = state => ({
  error: categoriesSelectors.getError(state),
  items: categoriesSelectors.getList(state),
  orderSaving: categoriesOrderSelectors.isSaving(state),
});

const mapDispatchToProps = {
  deleteItem: categoriesActions.deleteItem,
  fetchList: categoriesActions.fetchList,
  saveOrder: categoriesOrderActions.saveOrder,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withRouter,
  withStyles(styles),
)(CategoriesList);
