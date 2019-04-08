import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Layout from 'components/Layout';
import GridItem from 'components/GridItem';
import Link from 'next/link';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import { actions as partnersActions } from 'redux/partners';
import AddPartnerForm from './components/PartnerForm';
import AddUserForm from './components/AddUserForm';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
  },
  error: {
    color: 'red',
  },
});

const initialState = {
  users: [],
  error: false,
};
class AddPartner extends Component {
  state = initialState;

  createPartnerForm = React.createRef();

  addUserFrom = React.createRef();

  handleCreatePartner = (values) => {
    const { createPartner } = this.props;
    const { current: PartnerForm } = this.createPartnerForm;
    const { current: UserForm } = this.addUserFrom;
    UserForm.setSubmitting(true);
    createPartner({
      data: {
        ...values,
      },
      onSuccess: () => {
        PartnerForm.resetForm();
        UserForm.resetForm();
        this.setState({ ...initialState });
      },
      onFailure: () => {
        PartnerForm.setSubmitting(false);
        UserForm.setSubmitting(false);
        this.setState({ error: true });
      },
    });
  }

  handleAddTicketer = (email) => {
    const { users } = this.state;
    const { current } = this.addUserFrom;
    users.push({ email, roles: ['USHER'] });
    this.setState({
      users,
    }, current.resetForm());
  }

  handleRemoveTicketer = (val) => {
    const { users } = this.state;
    const { current } = this.addUserFrom;

    const filteredUsers = users.filter(({ email }) => email !== val);
    this.setState({
      users: filteredUsers,
    }, current.resetForm());
  }

  render() {
    const { classes } = this.props;
    const { users, error } = this.state;
    return (
      <Layout>
        <Link href="/" passHref prefetch>
          <Button component="a">
            Strona główna
          </Button>
        </Link>
        <Link href="/partners" passHref prefetch>
          <Button component="a">
            Partnerzy
          </Button>
        </Link>
        <Grid className={classes.root} container spacing={16}>
          <GridItem>
            {
              error
              && <Typography className={classes.error}>Wystąpił błąd</Typography>
            }
          </GridItem>
          <Grid item xs={7}>
            <AddPartnerForm
              FormikProps={{ ref: this.createPartnerForm }}
              onSubmit={this.handleCreatePartner}
              users={users}
            />
          </Grid>
          <Grid item xs={5}>
            <AddUserForm
              FormikProps={{ ref: this.addUserFrom }}
              users={users}
              onSubmit={this.handleAddTicketer}
              handleRemove={this.handleRemoveTicketer}
            />
          </Grid>
        </Grid>
      </Layout>
    );
  }
}

AddPartner.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  createPartner: PropTypes.func.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  createPartner: partnersActions.createPartner,
};

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
)(AddPartner);
