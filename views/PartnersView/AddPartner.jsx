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
import { selectors as partnersSelectors } from 'redux/partners';
import AddPartnerForm from './components/PartnerForm';
import AddUserForm from './components/UserForm';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    maxWidth: 1200,
    margin: '0 auto',
  },
  error: {
    color: 'red',
  },
  success: {
    color: 'green',
  },
  sectionWrapper: {
    marginTop: 40,
  },
});

class AddPartner extends Component {
  state = {
    success: false,
    userForm: {
      showUserForm: false,
      userFormError: '',
    },
  };

  createPartnerForm = React.createRef();

  addUserForm = React.createRef();

  handleAddUser = () => {
    const { current: { state: { values }, setSubmitting, resetForm } } = this.addUserForm;
    const { current: partnerForm } = this.createPartnerForm;
    const { setFieldValue, state: { values: PartnerValues } } = partnerForm;
    const { userForm } = this.state;
    const { users } = PartnerValues;
    setSubmitting(true);
    if (this.shouldAddUser(values, PartnerValues)) {
      users.push(values);
      setFieldValue('users', users);
      setSubmitting(false);
      this.setState({ userForm: { userSubmitError: false, showForm: false } });
      resetForm();
    } else {
      this.setState({ userForm: { ...userForm, userFormError: 'E-mail i nazwa muszą byc unikatowe!' } });
      setSubmitting(false);
    }
  }

  handleHideUserForm = () => {
    const { current } = this.addUserForm;
    const { userForm } = this.state;
    current.resetForm();
    this.setState({ userForm: { ...userForm, showUserForm: false } });
  }

  handleShowUserForm = () => {
    const { userForm } = this.state;
    this.setState({ userForm: { ...userForm, showUserForm: true } });
  }

  handleSubmitPartner = () => {
    const { current } = this.createPartnerForm;
    current.submitForm();
  }

  shouldAddUser = (userValues, partnerValues) => {
    const { email: partnerEmail, name: partnerName, users } = partnerValues;
    const { email: userEmail, name: userName } = userValues;
    return (
      !users.some(({ email, name }) => (email === userEmail || name === userName))
      && partnerEmail !== userEmail && userName !== partnerName
    );
  }

  partnerSubmitFailure = () => this.setState({ success: false });

  partnerSubmitSuccess = () => this.setState({ success: true });

  render() {
    const { error, classes } = this.props;
    const {
      success, userForm: { showUserForm, userFormError },
    } = this.state;
    return (
      <Layout>
        <Grid className={classes.root} container spacing={16}>
          <GridItem>
            <AddPartnerForm
              FormikProps={{ ref: this.createPartnerForm }}
              onSubmit={this.handleCreatePartner}
              onSuccess={this.partnerSubmitSuccess}
              onFailure={this.partnerSubmitFailure}
              listAction={this.handleShowUserForm}
            />
          </GridItem>
          <GridItem>
            {
              showUserForm
              && (
                <AddUserForm
                  FormikProps={{ ref: this.addUserForm }}
                  onSubmit={this.handleAddUser}
                  onDiscard={this.handleHideUserForm}
                  error={userFormError}
                />
              )
            }
          </GridItem>
          <Grid className={classes.sectionWrapper} container spacing={16} item direction="row-reverse" justify="space-between">
            <Grid item>
              <Button variant="contained" color="primary" onClick={this.handleSubmitPartner}>Utwórz partnera</Button>
            </Grid>
            <Grid item>
              {
                error
                && <Typography className={classes.error}>{error.data.message || 'Wystąpił nieznany błąd'}</Typography>
              }
              {
                success
                && (
                  <Typography className={classes.success}>
                      Pomyślnie założono konto partnera
                  </Typography>
                )
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
  error: PropTypes.shape({}),
};

AddPartner.defaultProps = {
  error: null,
};

const mapStateToProps = state => ({
  error: partnersSelectors.getError(state),
});

export default compose(
  withStyles(styles),
  connect(mapStateToProps),
)(AddPartner);
