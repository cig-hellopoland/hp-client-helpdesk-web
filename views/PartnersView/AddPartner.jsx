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
    maxWidth: 1200,
    margin: '0 auto',
  },
  error: {
    color: 'red',
  },
  sectionWrapper: {
    marginTop: 40,
  },
});

class AddPartner extends Component {
  state = {
    users: [],
    error: false,
    errorMessage: false,
  };

  createPartnerForm = React.createRef();

  addUserFrom = React.createRef();

  handleSubmit = () => {
    const { current } = this.createPartnerForm;
    current.submitForm();
  }

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
        this.setState({ users: [], error: false });
        UserForm.resetForm();
        PartnerForm.resetForm();
      },
      onFailure: (message) => {
        PartnerForm.setSubmitting(false);
        UserForm.setSubmitting(false);
        this.setState({ error: true, errorMessage: message });
      },
    });
  }

  handleAddTicketer = (user) => {
    const { users } = this.state;
    const { current } = this.addUserFrom;
    users.push(user);
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
    const { users, error, errorMessage } = this.state;
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
            <AddPartnerForm
              FormikProps={{ ref: this.createPartnerForm }}
              onSubmit={this.handleCreatePartner}
              users={users}
            />
          </GridItem>
          <GridItem className={classes.sectionWrapper}>
            <AddUserForm
              FormikProps={{ ref: this.addUserFrom }}
              users={users}
              onSubmit={this.handleAddTicketer}
              handleRemove={this.handleRemoveTicketer}
            />
          </GridItem>
          <Grid className={classes.sectionWrapper} container spacing={16} item direction="row-reverse" justify="space-between">
            <Grid item>
              <Button variant="contained" color="primary" onClick={this.handleSubmit}>Utwórz partnera</Button>
            </Grid>
            <Grid item>
              {
                error
                && <Typography className={classes.error}>{errorMessage || 'Wystąpił nieznany błąd'}</Typography>
              }
            </Grid>
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
