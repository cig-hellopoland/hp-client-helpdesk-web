import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
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
import SortableTableHead from './components/ListingViewTable/SortableTableHead';

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
  { id: 'item-id', label: '# ID' },
  { id: 'name', label: 'Nazwa' },
  { id: 'p24MerchantId', label: 'P24 Merchant ID' },
  { id: 'commission', label: 'Prowizja (%)' },
  { id: 'affiliation', label: 'Kod afiliacyjny' },
  { id: 'contact', label: 'Dane kontaktowe' },
  { id: 'details', label: '' },
];

class PartnersList extends Component {
  baseURL = '/market/partners';

  state = {
    isFetching: false,
    menuAnchor: null,
    menuItemId: null,
    snackbarOpen: false,
    snackbarMessage: '',
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
                  <Link href={`${this.baseURL}/create`} passHref prefetch>
                    <Button component="a">
                      <AddIcon className={classes.icon} />
                      Dodaj
                    </Button>
                  </Link>
                </Grid>
              </Grid>
            </Grid>
            {(sortedList.length === 0)
            && (
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
                      <Button className={classes.fetchButton} variant="outlined" onClick={this.handleFetchPartners}>
                        Ponów
                      </Button>
                    </Fragment>
                  )
                }
              </Grid>
            )
            }
            {sortedList.length > 0
              && (
                <Table aria-labelledby="tableTitle">
                  <SortableTableHead
                    columns={tableColumns}
                    orderBy="name"
                    onRequestSort={() => {}}
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
  error: PropTypes.shape({}).isRequired,
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
