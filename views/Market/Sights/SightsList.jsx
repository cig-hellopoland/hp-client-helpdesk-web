import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
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
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import Typography from '@material-ui/core/Typography';

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
  addDialogContent: {
    minHeight: 360,
    overflow: 'visible',
  },
  root: {
    minHeight: '100%',
  },
  actions: {
    minWidth: 200,
  },
  addButton: {
    fontSize: 0,
  },
  addButtonLabel: {
    fontSize: 14,
  },
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
  icon: {
    marginRight: theme.spacing.unit,
  },
  menuItem: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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
  partnerSelector: {
    position: 'relative',
  },
});

const normalizeSearchValue = value => (value || '')
  .toLocaleLowerCase('pl')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

class SightsList extends React.Component {
  baseURL = '/market/sights';

  state = {
    addDialogOpen: false,
    dialogOpen: false,
    dialogProps: {},
    isFetching: false,
    isFetchingPartners: false,
    menuAnchor: null,
    menuItemId: null,
    partnerMenuOpen: false,
    partnerQuery: '',
    selectedPartnerId: '',
    snackbarOpen: false,
    snackbarMessage: '',
    order: 'asc',
    orderBy: 'item-id',
    filterText: '',

  };

  componentDidMount() {
    const { router } = this.props;
    const { successMessage } = (router && router.query) || {};

    this.handleFetchItems();
    this.handleFetchPartners();

    if (successMessage) {
      this.handleSnackbarOpen(successMessage);
    }
  }

  componentDidUpdate(prevProps) {
    const { partnerId } = this.props;
    if (prevProps.partnerId !== partnerId) {
      this.handleFetchItems();
    }
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
    const { fetchList, partnerId } = this.props;

    fetchList({
      options: {
        headers: {
          'Content-Language': DEFAULT_LANGUAGE,
        },
        params: partnerId ? { partnerId } : {},
      },
      onFailure: this.handleFetchItemsFailure,
      onSuccess: this.handleFetchItemsSuccess,
    });

    this.setState({ isFetching: true });
  };

  handleFetchPartnersFailure = () => this.setState({ isFetchingPartners: false });

  handleFetchPartnersSuccess = () => this.setState({ isFetchingPartners: false });

  handleFetchPartners = () => {
    const { fetchPartners, partnerId } = this.props;

    if (partnerId) {
      return;
    }

    fetchPartners({
      options: {
        headers: {
          'Content-Language': DEFAULT_LANGUAGE,
        },
      },
      onFailure: this.handleFetchPartnersFailure,
      onSuccess: this.handleFetchPartnersSuccess,
    });

    this.setState({ isFetchingPartners: true });
  };

  handleItemCreate = () => {
    const { partnerId, router } = this.props;
    if (!partnerId) {
      this.handleAddDialogOpen();
      return;
    }

    const successMessage = encodeURIComponent('Zapisano obiekt.');
    const returnTo = encodeURIComponent(
      `/market/partners/edit?itemId=${partnerId}&tab=objects&successMessage=${successMessage}`,
    );
    const href = `${this.baseURL}/create?partnerId=${partnerId}&returnTo=${returnTo}`;

    router.push(href);
  };

  handleAddDialogOpen = () => this.setState({
    addDialogOpen: true,
    partnerMenuOpen: false,
    partnerQuery: '',
    selectedPartnerId: '',
  });

  handleAddDialogClose = () => this.setState({
    addDialogOpen: false,
    partnerMenuOpen: false,
    partnerQuery: '',
    selectedPartnerId: '',
  });

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

  handlePartnerCreate = () => {
    const { router } = this.props;
    const { selectedPartnerId } = this.state;

    if (!selectedPartnerId) {
      return;
    }

    const successMessage = encodeURIComponent('Zapisano obiekt.');
    const returnTo = encodeURIComponent(`${this.baseURL}?successMessage=${successMessage}`);

    router.push(`${this.baseURL}/create?partnerId=${selectedPartnerId}&returnTo=${returnTo}`);
    this.handleAddDialogClose();
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
      addDialogOpen, dialogOpen, dialogProps, isFetching, isFetchingPartners, menuAnchor,
      menuItemId, partnerMenuOpen, partnerQuery, selectedPartnerId, snackbarMessage, snackbarOpen,
    } = this.state;
    const {
      classes, embedded, items, partners, showPartner,
    } = this.props;
    const { order, orderBy, filterText } = this.state;

    const baseList = items || [];
    const hasItems = baseList.length > 0;

    // 1. filtrowanie po nazwie / mieście / partnerze
    const query = (filterText || '').toLowerCase();
    const filteredList = baseList.filter((item) => {
      if (!query) return true;

      const name = (item.name || '').toLowerCase();
      const city = ((item.location && item.location.city) || '').toLowerCase();
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
    const columns = showPartner
      ? tableColumns
      : tableColumns.filter(column => column.id !== 'partner');
    const partnerOptions = this.getFilteredPartners(partners, partnerQuery, selectedPartnerId);


    const content = (
      <Grid container className={classes.root}>
        <Paper className={classes.paper}>
          <Grid container alignItems="flex-end" justify="space-between" className={classes.toolbar}>
            <Grid item>
              <Button className={classes.addButton} onClick={this.handleItemCreate}>
                <AddIcon className={classes.icon} />
                <span className={classes.addButtonLabel}>Dodaj</span>
              </Button>
            </Grid>
            {hasItems && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label={showPartner
                    ? 'Filtruj (nazwa, lokalizacja, partner)'
                    : 'Filtruj (nazwa, lokalizacja)'}
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
            )}
          </Grid>
          {/* 1) Brak jakichkolwiek obiektów w systemie */}
          {!hasItems && !isFetching && (
            <EmptyView
              image={PlaceIcon}
              label="Brak obiektów"
              loading={isFetching}
              message="Ponów zapytanie aby wyświetlić listę."
              onRefresh={this.handleFetchItems}
            />
          )}

          {/* 2) Mamy jakieś obiekty – pokazujemy filtr + tabelę / informację o braku wyników */}
          {hasItems && (
            <React.Fragment>
              {/* Pasek filtrowania zawsze widoczny, gdy są jakieś obiekty */}
              {/* Jeśli filtr nic nie znalazł – nie pokazujemy EmptyView, tylko komunikat */}
              {sortedList.length === 0 ? (
                <Grid container justify="center" style={{ padding: 16 }}>
                  <Typography variant="subtitle1">
                    {`Brak wyników dla filtra: "${filterText}"`}
                  </Typography>
                </Grid>
              ) : (
                <Table aria-labelledby="items-list">
                  <SortableTableHead
                    columns={columns}
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
                        <TableCell>{location && location.city}</TableCell>
                        {showPartner && <TableCell>{partnerName}</TableCell>}
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
                <DialogTitle id="alert-dialog-title">
                  Usuń obiekt
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    {`Czy na pewno usunąć obiekt "${dialogProps.name}"?`}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={this.handleDialogClose}
                    color="primary"
                    disabled={dialogProps.deleting}
                  >
                    Anuluj
                  </Button>
                  <Button
                    onClick={() => this.handleDeleteItem(dialogProps.itemId)}
                    color="primary"
                    disabled={dialogProps.deleting}
                  >
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
          )}

          <Dialog
            open={addDialogOpen}
            onClose={this.handleAddDialogClose}
            aria-labelledby="add-sight-dialog-title"
            fullWidth
            maxWidth="md"
          >
            <DialogTitle id="add-sight-dialog-title">
              Dodaj obiekt
            </DialogTitle>
            <DialogContent className={classes.addDialogContent}>
              <Grid container spacing={16}>
                <Grid item xs={12}>
                  <ClickAwayListener onClickAway={this.handlePartnerMenuClose}>
                    <div className={classes.partnerSelector}>
                      <TextField
                        disabled={isFetchingPartners}
                        fullWidth
                        label="Partner"
                        onChange={this.handlePartnerSearchChange}
                        onFocus={this.handlePartnerFocus}
                        onKeyDown={this.handlePartnerKeyDown}
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
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleAddDialogClose} color="primary">
                Anuluj
              </Button>
              <Button
                onClick={this.handlePartnerCreate}
                color="primary"
                disabled={!selectedPartnerId}
              >
                Dodaj
              </Button>
            </DialogActions>
          </Dialog>

        </Paper>
      </Grid>
    );

    return embedded ? content : <Layout>{content}</Layout>;
  }
}

SightsList.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  deleteItem: PropTypes.func.isRequired,
  embedded: PropTypes.bool,
  error: PropTypes.shape({}),
  fetchList: PropTypes.func.isRequired,
  fetchPartners: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  partnerId: PropTypes.number,
  partners: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  router: PropTypes.shape({}).isRequired,
  showPartner: PropTypes.bool,
  updateItem: PropTypes.func.isRequired,
};

SightsList.defaultProps = {
  embedded: false,
  error: null,
  partnerId: null,
  showPartner: true,
};

const mapStateToProps = state => ({
  error: sightsSelectors.getError(state),
  items: sightsSelectors.getSights(state),
  partners: partnersSelectors.getList(state),
});

const mapDispatchToProps = {
  deleteItem: sightsActions.deleteItem,
  fetchList: sightsActions.fetchList,
  fetchPartners: partnersActions.fetchList,
  updateItem: sightsActions.updateItem,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withRouter,
  withStyles(styles),
)(SightsList);
