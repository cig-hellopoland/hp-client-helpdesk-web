import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import withAuth from 'services/auth/withAuth';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Layout from 'components/Layout';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import Link from 'next/link';
import SortableTableHead from './components/ListingViewTable/SortableTableHead';

const styles = theme => ({
  root: {
    flex: 1,
  },
  icon: {
    marginRight: theme.spacing.unit,
  },
  toolbar: {
    padding: theme.spacing.unit,
  },
});

const tableColumns = [
  { id: 'item-id', label: '# ID', sortable: true },
  { id: 'name', label: 'Nazwa', sortable: true },
  { id: 'p24MerchantId', label: 'P24 Merchant ID', sortable: true },
  { id: 'commission', label: 'Prowizja (%)', sortable: true },
  { id: 'affiliation', label: 'Kod afiliacyjny' },
  { id: 'contact', label: 'Dane kontaktowe' },
];

const PartnersList = ({ classes, list }) => (
  <Layout>
    <Grid container>
      <Paper className={classes.root}>
        <Grid container direction="column" className={classes.toolbar}>
          <Grid item>
            <Typography variant="h6">Lista partnerów</Typography>
          </Grid>
          <Grid container item justify="flex-end">
            <Grid item>
              <Link href="/partners/create" passHref prefetch>
                <Button component="a">
                  <AddIcon className={classes.icon} />
                  Dodaj
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Grid>
        <Table aria-labelledby="tableTitle">
          <SortableTableHead
            columns={tableColumns}
            orderBy="name"
            onRequestSort={console.log}
          />
          <TableBody>
            {
              list.map(partner => (
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
      </Paper>
    </Grid>
  </Layout>
);

PartnersList.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  list: PropTypes.arrayOf(PropTypes.shape({
    affiliateCode: PropTypes.string,
    commission: PropTypes.number,
    email: PropTypes.string,
    id: PropTypes.number,
    name: PropTypes.string,
    p24MerchantId: PropTypes.number,
  })),
};

PartnersList.defaultProps = {
  list: [
    {
      id: 1, name: 'A-Kolejkowo', p24MerchantId: 123, commission: 20, affiliateCode: 'ad01c10b', email: 'partner@example.com', phone: '+48 123 456 789',
    },
    {
      id: 2, name: 'B-Kolejkowo', p24MerchantId: 123, commission: 20, affiliateCode: 'ad01c10b', email: 'partner@example.com', phone: '+48 123 456 789',
    },
    {
      id: 3, name: 'C-Kolejkowo', p24MerchantId: 123, commission: 20, affiliateCode: 'ad01c10b', email: 'partner@example.com', phone: '+48 123 456 789',
    },
    {
      id: 4, name: 'D-Kolejkowo', p24MerchantId: 123, commission: 20, affiliateCode: 'ad01c10b', email: 'partner@example.com', phone: '+48 123 456 789',
    },
    {
      id: 5, name: 'E-Kolejkowo', p24MerchantId: 123, commission: 20, affiliateCode: 'ad01c10b', email: 'partner@example.com', phone: '+48 123 456 789',
    },
    {
      id: 6, name: 'F-Kolejkowo', p24MerchantId: 123, commission: 20, affiliateCode: 'ad01c10b', email: 'partner@example.com', phone: '+48 123 456 789',
    },
    {
      id: 7, name: 'G-Kolejkowo', p24MerchantId: 123, commission: 20, affiliateCode: 'ad01c10b', email: 'partner@example.com', phone: '+48 123 456 789',
    },
    {
      id: 8, name: 'H-Kolejkowo', p24MerchantId: 123, commission: 20, affiliateCode: 'ad01c10b', email: 'partner@example.com', phone: '+48 123 456 789',
    },
  ],
};

export default compose(
  withAuth(),
  withStyles(styles),
)(PartnersList);
