import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import withAuth from 'services/auth/withAuth';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Layout from 'components/Layout';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import DomainIcon from '@material-ui/icons/Domain';
import Link from 'next/link';
import {
  actions as partnersActions,
  selectors as partnersSelectors,
} from 'redux/partners';
import SortableTableHead from './components/ListingViewTable/SortableTableHead';

const styles = theme => ({
  root: {
    minHeight: '100%',
  },
  paper: {
    flex: 1,
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
];

class PartnersList extends Component {
  state = {
    isFetching: false,
  };

  componentDidMount() {
    this.handleFetchPartners();
  }

  handleFetchPartners = () => {
    const { fetchList } = this.props;

    fetchList({
      onFailure: this.handleFetchPartnersFailure,
      onSuccess: this.handleFetchPartnersSuccess,
    });

    this.setState({ isFetching: true });
  };

  handleFetchPartnersFailure = () => this.setState({ isFetching: false });

  handleFetchPartnersSuccess = () => this.setState({ isFetching: false });

  render() {
    const { isFetching } = this.state;
    const { classes, items: sortedList } = this.props;

    return (
      <Layout>
        <Grid container className={classes.root}>
          <Paper className={classes.paper}>
            <Grid container direction="column" className={classes.toolbar}>
              <Grid container item justify="flex-end">
                <Grid item>
                  <Link href="/market/partners/create" passHref prefetch>
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
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              )
            }
          </Paper>
        </Grid>
      </Layout>
    );
  }
}

PartnersList.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  fetchList: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    affiliateCode: PropTypes.string,
    commission: PropTypes.number,
    email: PropTypes.string,
    id: PropTypes.number,
    name: PropTypes.string,
    p24MerchantId: PropTypes.number,
  })).isRequired,
};

const mapStateToProps = state => ({
  items: partnersSelectors.getList(state),
});

const mapDispatchToProps = {
  fetchList: partnersActions.fetchList,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withStyles(styles),
)(PartnersList);
