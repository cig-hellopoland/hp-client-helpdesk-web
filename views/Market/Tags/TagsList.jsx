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
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import LockIcon from '@material-ui/icons/Lock';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import StarIcon from '@material-ui/icons/Star';
import Link from 'next/link';
import { withRouter } from 'next/router';
import {
  actions as tagsActions,
  selectors as tagsSelectors,
} from '@hello-poland/commons/redux/tags';
import withAuth from 'services/auth/withAuth';
import { DEFAULT_LANGUAGE } from 'utils/translations';

import Layout from 'components/Layout';
import EmptyView from 'components/EmptyView';
import SortableTableHead from '../Partners/components/ListingViewTable/SortableTableHead';

const tableColumns = [
  { id: 'icon', label: 'Ikona' },
  { id: 'name', label: 'Nazwa kategorii' },
  { id: 'count', label: 'Liczba ofert' },
  { id: 'details', label: '' },
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
});

class TagsList extends React.Component {
  baseURL = '/market/tags';

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

  handleMenuOpen = (event, menuItemId) => this.setState({
    menuAnchor: event.currentTarget,
    menuItemId,
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
    } = this.state;
    const { classes, items: sortedList } = this.props;

    const colorActive = 'primary';
    const colorInactive = 'disabled';

    return (
      <Layout>
        <Grid container className={classes.root}>
          <Paper className={classes.paper}>
            <Grid container direction="column" className={classes.toolbar}>
              <Grid container item justify="flex-end">
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
            {sortedList.length === 0
              && (
                <EmptyView
                  image={LocalOfferIcon}
                  label="Brak tagów"
                  loading={isFetching}
                  message="Dodaj tag lub ponów zapytanie aby wyświetlić listę."
                  onRefresh={this.handleFetchItems}
                />
              )
            }
            {sortedList.length > 0
              && (
                <React.Fragment>
                  <Table aria-labelledby="items-list">
                    <SortableTableHead columns={tableColumns} orderBy="name" onRequestSort={() => {}} />
                    <TableBody>
                      {
                        sortedList.map(({
                          assignedItemsCount, label, iconUrl, id: listItemId, restricted,
                          recommended,
                        }) => (
                          <TableRow key={listItemId} hover>
                            <TableCell className={classes.iconCell} align="center">
                              {iconUrl
                                ? <img src={iconUrl} height={48} width={48} alt={label} />
                                : <ErrorOutlineIcon color="error" />
                              }
                            </TableCell>
                            <TableCell>
                              <Typography>{label}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{assignedItemsCount}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton disabled>
                                <LockIcon color={restricted ? colorActive : colorInactive} />
                              </IconButton>
                              <IconButton disabled>
                                <StarIcon color={recommended ? colorActive : colorInactive} />
                              </IconButton>
                              <IconButton
                                aria-owns={menuAnchor ? 'item-menu' : undefined}
                                aria-haspopup="true"
                                onClick={event => this.handleMenuOpen(event, listItemId)}
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

TagsList.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  deleteItem: PropTypes.func.isRequired,
  error: PropTypes.shape({}),
  fetchList: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    assignedItemsCount: PropTypes.number,
    iconUrl: PropTypes.string,
    id: PropTypes.number,
    label: PropTypes.string,
    restricted: PropTypes.bool,
    recommended: PropTypes.bool,
  })).isRequired,
  router: PropTypes.shape({}).isRequired,
};

TagsList.defaultProps = {
  error: null,
};

const mapStateToProps = state => ({
  error: tagsSelectors.getError(state),
  items: tagsSelectors.getList(state),
});

const mapDispatchToProps = {
  deleteItem: tagsActions.deleteItem,
  fetchList: tagsActions.fetchList,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withRouter,
  withStyles(styles),
)(TagsList);
