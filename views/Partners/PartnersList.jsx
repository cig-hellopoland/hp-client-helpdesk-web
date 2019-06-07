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
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import CallIcon from '@material-ui/icons/Call';
import MailIcon from '@material-ui/icons/Mail';
import Link from 'next/link';

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
          <TableHead>
            <TableRow>
              <TableCell># ID</TableCell>
              <TableCell>Nazwa</TableCell>
              <TableCell>P24 Merchant ID</TableCell>
              <TableCell>Prowizja</TableCell>
              <TableCell>Kod afiliacyjny</TableCell>
              <TableCell>Dane kontaktowe</TableCell>
            </TableRow>
          </TableHead>
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
      id: 1, name: 'Kolejkowo', p24MerchantId: 123, commission: 20, affiliateCode: 'ad01c10b', email: 'partner@example.com', phone: '+48 123 456 789',
    },
    {
      id: 2, name: 'Kolejkowo', p24MerchantId: 123, commission: 20, affiliateCode: 'ad01c10b', email: 'partner@example.com', phone: '+48 123 456 789',
    },
    {
      id: 3, name: 'Kolejkowo', p24MerchantId: 123, commission: 20, affiliateCode: 'ad01c10b', email: 'partner@example.com', phone: '+48 123 456 789',
    },
    {
      id: 4, name: 'Kolejkowo', p24MerchantId: 123, commission: 20, affiliateCode: 'ad01c10b', email: 'partner@example.com', phone: '+48 123 456 789',
    },
    {
      id: 5, name: 'Kolejkowo', p24MerchantId: 123, commission: 20, affiliateCode: 'ad01c10b', email: 'partner@example.com', phone: '+48 123 456 789',
    },
    {
      id: 6, name: 'Kolejkowo', p24MerchantId: 123, commission: 20, affiliateCode: 'ad01c10b', email: 'partner@example.com', phone: '+48 123 456 789',
    },
    {
      id: 7, name: 'Kolejkowo', p24MerchantId: 123, commission: 20, affiliateCode: 'ad01c10b', email: 'partner@example.com', phone: '+48 123 456 789',
    },
    {
      id: 8, name: 'Kolejkowo', p24MerchantId: 123, commission: 20, affiliateCode: 'ad01c10b', email: 'partner@example.com', phone: '+48 123 456 789',
    },
  ],
};

export default compose(
  withAuth(),
  withStyles(styles),
)(PartnersList);
