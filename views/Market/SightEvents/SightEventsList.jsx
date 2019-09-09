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
import LocalPlayIcon from '@material-ui/icons/LocalPlay';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import LockIcon from '@material-ui/icons/Lock';
import PublicIcon from '@material-ui/icons/Public';
import { withRouter } from 'next/router';
import {
  actions as sightEventsActions,
  selectors as sightEventsSelectors,
} from '@hello-poland/commons/redux/sightEvents';
import withAuth from 'services/auth/withAuth';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import Layout from 'components/Layout';
import EmptyView from 'components/EmptyView';
import SortableTableHead from '../Partners/components/ListingViewTable/SortableTableHead';

const tableColumns = [
  { id: 'item-id', label: '# ID' },
  { id: 'name', label: 'Nazwa oferty' },
  { id: 'location', label: 'Lokalizacja' },
  { id: 'partner', label: 'Partner' },
  { id: 'details', label: '' },
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

class CategoriesList extends React.Component {
  baseURL = '/market/sight-events';

  state = {
    dialogOpen: false,
    dialogProps: {},
    isFetching: false,
    menuAnchor: null,
    menuItemId: null,
    snackbarOpen: false,
    snackbarMessage: '',
  };

  componentDidMount() {
    this.handleFetchItems();
  }

  handleBlockItem = (itemId) => {
    console.log('handleBlockItem', itemId);

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
    this.handleFetchCategories();
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

  handleMenuOpen = (event, categoryId) => this.setState({
    menuAnchor: event.currentTarget,
    menuItemId: categoryId,
  });

  handleMenuClose = () => this.setState({ menuAnchor: null });

  handleMenuExited = () => this.setState({ menuItemId: null });

  handlePublishItem = (itemId) => {
    console.log('handlePublishItem', itemId);

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
    const sortedList = items || [];
    const colorActive = 'primary';
    const colorInactive = 'disabled';

    return (
      <Layout>
        <Grid container className={classes.root}>
          <Paper className={classes.paper}>
            {sortedList.length === 0
              && (
                <EmptyView
                  image={LocalPlayIcon}
                  label="Brak ofert"
                  loading={isFetching}
                  message="Ponów zapytanie aby wyświetlić listę."
                  onRefresh={this.handleFetchItems}
                />
              )
            }
            {sortedList.length > 0
              && (
                <React.Fragment>
                  <Table aria-labelledby="categories-list">
                    <SortableTableHead columns={tableColumns} orderBy="name" onRequestSort={() => {}} />
                    <TableBody>
                      {
                        sortedList.map(({
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
                                aria-owns={menuAnchor ? 'category-menu' : undefined}
                                aria-haspopup="true"
                                onClick={event => this.handleMenuOpen(event, itemId)}
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
                    id="category-menu"
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
                    <DialogTitle id="alert-dialog-title">
                      Usuń kategorię
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText id="alert-dialog-description">
                        {`Czy napewno usunąć ofertę "${dialogProps.name}"?`}
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={this.handleDialogClose} color="primary" disabled={dialogProps.deleting}>
                        Anuluj
                      </Button>
                      <Button onClick={() => this.handleDeleteItem(dialogProps.categoryId)} color="primary" disabled={dialogProps.deleting}>
                        OK
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
              )
            }
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
  })).isRequired,
  router: PropTypes.shape({}).isRequired,
};

CategoriesList.defaultProps = {
  error: null,
};

const mapStateToProps = state => ({
  error: sightEventsSelectors.getError(state),
  items: sightEventsSelectors.getSightEvents(state),
});

const mapDispatchToProps = {
  deleteItem: sightEventsActions.deleteItem,
  fetchList: sightEventsActions.fetchList,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withRouter,
  withStyles(styles),
)(CategoriesList);
