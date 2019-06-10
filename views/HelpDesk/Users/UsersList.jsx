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
  actions as usersActions,
  selectors as usersSelectors,
} from 'redux/users';
import SortableTableHead from '../../../components/SortableTableHead/SortableTableHead';

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
  { id: 'name', label: 'Nazwa' },
  { id: 'email', label: 'Email' },
  { id: 'role', label: 'Rola' },
];

class UsersList extends Component {
  state = {
    isFetching: false,
  };

  componentDidMount() {
    this.handleFetchUsers();
  }

  handleFetchUsers = () => {
    const { fetchList } = this.props;

    fetchList({
      onFailure: this.handleFetchUsersFailure,
      onSuccess: this.handleFetchUsersSuccess,
    });

    this.setState({ isFetching: true });
  };

  handleFetchUsersFailure = () => this.setState({ isFetching: false });

  handleFetchUsersSuccess = () => this.setState({ isFetching: false });

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
                  <Link href="/market/users/create" passHref prefetch>
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
                      <Typography variant="h6">Brak użytkowników</Typography>
                      <Typography>
                        Dodaj użytkowników lub ponów zapytanie aby wyświetlić listę.
                      </Typography>
                      <Button className={classes.fetchButton} variant="outlined" onClick={this.handleFetchUsers}>
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
                  <SortableTableHead columns={tableColumns} orderBy="name" />
                  <TableBody>
                    {
                      sortedList.map(user => (
                        <TableRow key={user.id} hover>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
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

UsersList.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  fetchList: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    email: PropTypes.string,
    id: PropTypes.number,
    name: PropTypes.string,
    role: PropTypes.string,
  })).isRequired,
};

const mapStateToProps = state => ({
  items: usersSelectors.getList(state),
});

const mapDispatchToProps = {
  fetchList: usersActions.fetchList,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth(),
  withStyles(styles),
)(UsersList);
