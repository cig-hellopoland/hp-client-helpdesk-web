import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _merge from 'lodash/merge';
import withAuth from 'services/auth/withAuth';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Layout from 'components/Layout';
import LinearProgress from '@material-ui/core/LinearProgress';
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
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import DomainIcon from '@material-ui/icons/Domain';
import LockIcon from '@material-ui/icons/Lock';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Link from 'next/link';
import { withRouter } from 'next/router';
import {
  actions as partnersActions,
  selectors as partnersSelectors,
} from 'redux/partners';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import ListingFilters, {
  matchesLocationFilters,
  matchesSearchText,
  matchesStatusFilter,
} from 'components/ListingFilters';
import SortableTableHead from './components/ListingViewTable/SortableTableHead';

const styles = theme => ({
  root: {
    minHeight: '100%',
  },
  actions: {
    minWidth: 150,
  },
  addButton: {
    fontSize: 0,
  },
  addButtonLabel: {
    fontSize: 14,
  },
  paper: {
    flex: 1,
    overflow: 'hidden',
  },
  fetchButton: {
    marginTop: theme.spacing.unit * 3,
  },
  icon: {
    marginRight: theme.spacing.unit,
  },
  placeholder: {
    height: '100%',
  },
  placeholderIcon: {
    color: theme.palette.grey[500],
    fontSize: theme.spacing.unit * 10,
  },
  placeholderProgress: {
    width: theme.spacing.unit * 10,
  },
  toolbar: {
    padding: theme.spacing.unit,
  },
});

const tableColumns = [
  { id: 'item-id', label: '# ID', sortable: true  },
  { id: 'name', label: 'Nazwa', sortable: true  },
  { id: 'p24MerchantId', label: 'P24 Merchant ID', sortable: true  },
  { id: 'commission', label: 'Prowizja (%)', sortable: true  },
  { id: 'affiliation', label: 'Kod afiliacyjny', sortable: false },
  { id: 'contact', label: 'Dane kontaktowe', sortable: true  },
  { id: 'details', label: '', sortable: false  },
];

class PartnersList extends Component {
  baseURL = '/market/partners';

  state = {
    isFetching: false,
    menuAnchor: null,
    menuItemId: null,
    snackbarOpen: false,
    snackbarMessage: '',
    order: 'asc',
    orderBy: 'item-id',
    filterText: '',
    voivodeship: '',
    county: '',
    city: '',
    status: '',
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

      this.handleUpdateItem(itemId, {
        data: { blocked: !blocked },
        options: {
          method: 'patch',
        },
      });
    }

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
    const { name, value } = event.target;
    this.setState((state) => {
      const nextState = { [name]: value };
      if (name === 'voivodeship') {
        nextState.county = '';
        nextState.city = '';
      } else if (name === 'county') {
        nextState.city = '';
      }
      return { ...state, ...nextState };
    });
  };

  handleClearFilters = () => this.setState({
    filterText: '',
    voivodeship: '',
    county: '',
    city: '',
    status: '',
  });


  handleItemEdit = (itemId) => {
    const { router } = this.props;

    const href = `${this.baseURL}/edit?itemId=${itemId}`;
    const pathname = `${this.baseURL}/${itemId}/edit`;

    router.push(href, pathname);

    this.handleMenuClose();
  };

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

  handleFetchItemsFailure = () => this.setState({ isFetching: false });

  handleFetchItemsSuccess = () => this.setState({ isFetching: false });

  handleMenuOpen = (event, itemId) => this.setState({
    menuAnchor: event.currentTarget,
    menuItemId: itemId,
  });

  handleMenuClose = () => this.setState({ menuAnchor: null });

  handleMenuExited = () => this.setState({ menuItemId: null });

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

  handleUpdateItem = (itemId, payload) => {
    const { updateItem } = this.props;
    const item = this.getItemById(itemId);

    if (item) {
      const { defaultLanguage } = item;
      const request = {
        id: itemId,
        onFailure: this.handleUpdateItemFailure,
        onSuccess: this.handleUpdateItemSuccess,
        options: {
          headers: {
            'Content-Language': defaultLanguage,
          },
        },
      };

      updateItem(_merge(request, payload));
    }
  };

  isItemBlocked = (itemId) => {
    const { items } = this.props;
    const selectedItem = items && items.find(item => item.id === itemId);

    if (selectedItem) {
      return !!selectedItem.blocked;
    }

    return false;
  };

  render() {
const {
  isFetching, menuAnchor, menuItemId, snackbarMessage, snackbarOpen,
  order, orderBy, filterText, voivodeship, county, city, status,
} = this.state;
const { classes, items } = this.props;

// 1. lista bazowa
const baseList = items || [];
const hasItems = baseList.length > 0;

const filteredList = baseList.filter((partner) => {
  const matchesText = matchesSearchText([
    partner.id, partner.name, partner.p24MerchantId, partner.commission,
    partner.affiliateCode, partner.email, partner.phone,
  ], filterText);

  return matchesText
    && matchesLocationFilters(partner, { voivodeship, county, city })
    && matchesStatusFilter(partner, status);
});

// 3. sortowanie
const sortedList = [...filteredList].sort((a, b) => {
  let aValue;
  let bValue;

  switch (orderBy) {
    case 'item-id':
      aValue = a.id;
      bValue = b.id;
      break;
    case 'p24MerchantId':
      aValue = a.p24MerchantId || '';
      bValue = b.p24MerchantId || '';
      break;
    case 'commission':
      aValue = a.commission || 0;
      bValue = b.commission || 0;
      break;
    case 'affiliation':
      aValue = a.affiliateCode || '';
      bValue = b.affiliateCode || '';
      break;
    case 'contact':
      aValue = `${a.email || ''} ${a.phone || ''}`;
      bValue = `${b.email || ''} ${b.phone || ''}`;
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
const filterValues = {
  filterText, voivodeship, county, city, status,
};
const extraFilters = [{
  key: 'status',
  label: 'Status',
  options: [
    { label: 'Aktywni', value: 'active' },
    { label: 'Zablokowani', value: 'blocked' },
  ],
}];
    return (
     <Layout>
       <Grid container className={classes.root}>
          <Paper className={classes.paper}>
            <Grid container alignItems="center" justify="space-between" className={classes.toolbar}>
              <Grid item>
                <Link href={`${this.baseURL}/create`} passHref prefetch>
                  <Button component="a" className={classes.addButton}>
                    <AddIcon className={classes.icon} />
                    <span className={classes.addButtonLabel}>Dodaj</span>
                  </Button>
                </Link>
              </Grid>
            </Grid>
            {hasItems && (
              <ListingFilters
                extraFilters={extraFilters}
                items={baseList}
                onChange={this.handleFilterChange}
                onClear={this.handleClearFilters}
                searchLabel="Szukaj partnera (nazwa, ID, kontakt, P24, afiliacja)"
                totalCount={baseList.length}
                values={filterValues}
                visibleCount={sortedList.length}
              />
            )}
            {!hasItems && (
              <Grid container item className={classes.placeholder} direction="column" alignItems="center" justify="center">
                {isFetching
                  ? (
                    <Fragment>
                      <CloudDownloadIcon className={classes.placeholderIcon} />
                      <LinearProgress className={classes.placeholderProgress} />
                    </Fragment>
                  )
                  : (
                    <Fragment>
                      <DomainIcon className={classes.placeholderIcon} />
                      <Typography variant="h6">Brak partnerów</Typography>
                      <Typography>
                        Dodaj partnera lub ponów zapytanie aby wyświetlić listę.
                      </Typography>
                      <Button className={classes.fetchButton} variant="outlined" onClick={this.handleFetchItems}>
                        Ponów
                      </Button>
                    </Fragment>
                  )
                }
              </Grid>
            )
            }
          {hasItems && sortedList.length === 0 && (
            <Grid
              container
              item
              className={classes.placeholder}
              direction="column"
              alignItems="center"
              justify="center"
            >
              <Typography variant="h6">Brak wyników dla filtra</Typography>
              <Typography>
                Zmień lub wyczyść filtry powyżej.
              </Typography>
            </Grid>
          )}

{hasItems && sortedList.length > 0 && (
  <Table aria-labelledby="tableTitle">
    <SortableTableHead
      columns={tableColumns}
      order={order}
      orderBy={orderBy}
      onRequestSort={this.handleRequestSort}
    />
                  <TableBody>
                    {
                      sortedList.map(partner => (
                        <TableRow key={partner.id} hover>
                          <TableCell>{partner.id}</TableCell>
                          <TableCell>{partner.name}</TableCell>
                          <TableCell>{partner.p24MerchantId}</TableCell>
                          <TableCell>{`${partner.commission} %`}</TableCell>
                          <TableCell>{partner.affiliateCode}</TableCell>
                          <TableCell>
                            <Typography>{partner.email}</Typography>
                            <Typography>{partner.phone}</Typography>
                          </TableCell>
                          <TableCell align="right" className={classes.actions}>
                            <IconButton disabled>
                              <LockIcon color={partner.blocked ? colorActive : colorInactive} />
                            </IconButton>
                            <IconButton
                              aria-owns={menuAnchor ? 'item-menu' : undefined}
                              aria-haspopup="true"
                              onClick={event => this.handleMenuOpen(event, partner.id)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              )
            }
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
            </Menu>
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
        </Grid>
      </Layout>
    );
  }
}

PartnersList.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  error: PropTypes.shape({}),
  fetchList: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    affiliateCode: PropTypes.string,
    commission: PropTypes.number,
    email: PropTypes.string,
    id: PropTypes.number,
    name: PropTypes.string,
    p24MerchantId: PropTypes.number,
  })).isRequired,
  router: PropTypes.shape({}).isRequired,
  updateItem: PropTypes.func.isRequired,
};

PartnersList.defaultProps = {
  error: null,
};

const mapStateToProps = state => ({
  error: partnersSelectors.getError(state),
  items: partnersSelectors.getList(state),
});

const mapDispatchToProps = {
  fetchList: partnersActions.fetchList,
  updateItem: partnersActions.updateItem,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withRouter,
  withStyles(styles),
)(PartnersList);
