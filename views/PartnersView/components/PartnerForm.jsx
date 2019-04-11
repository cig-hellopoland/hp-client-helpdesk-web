import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import IconClear from '@material-ui/icons/Clear';
import IconBlock from '@material-ui/icons/Block';
import {
  List, ListItem, ListItemText, ListItemSecondaryAction,
} from '@material-ui/core';
import {
  Formik, Form, Field, FieldArray,
} from 'formik';
import { TextField } from 'formik-material-ui';
import yupObject from 'yup/lib/object';
import yupString from 'yup/lib/string';
import yupNumber from 'yup/lib/number';
import GridItem from 'components/GridItem';
import AlertDialog from 'components/AlertDialog';
import withStyles from '@material-ui/core/styles/withStyles';

const commonProps = {
  fullWidth: true,
};

const initialDialogState = {
  content: null,
  onSuccess: null,
  open: false,
  title: null,
};

const styles = {
  error: {
    color: 'red',
  },
  sectionWrapper: {
    marginTop: 40,
  },
};

class AddPartnerForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      partnerInitialValues: {
        email: '',
        name: '',
        commission: 0,
        p24MerchantId: '',
        affiliateCode: '',
        users: [],
      },
      alertDialog: initialDialogState,
      userInitialValues: {
        email: '',
        name: '',
        roles: ['USHER'],
      },
      userForm: {
        userSubmitError: '',
        showForm: false,
      },
    };

    this.partnerValidationSchema = yupObject().shape({
      email: yupString().email().trim().required(),
      name: yupString().required(),
      commission: yupNumber().min(0).max(100).required(),
      p24MerchantId: yupString().required(),
      affiliateCode: yupString(),
    });

    this.userValidationSchema = yupObject().shape({
      email: yupString().email().trim().required(),
      name: yupString().required(),
    });
  }

  setUsers = (users) => {
    const { initialValues } = this.state;
    initialValues.users = users;
    this.setState({ initialValues });
  }

  handleClose = () => this.setState({ alertDialog: initialDialogState });


  handleRemoveUserDialogOpen = (successCallback) => {
    this.setState({
      alertDialog: {
        content: 'Czy jesteś pewnien?',
        title: 'Usuwanie użytkownika',
        open: true,
        onSuccess: () => {
          this.handleClose();
          successCallback();
        },
      },
    });
  }

  shouldAddUser = (userValues, partnerValues) => {
    const { email: partnerEmail, name: partnerName, users } = partnerValues;
    const { email: userEmail, name: userName } = userValues;
    return (
      !users.some(({ email, name }) => (email === userEmail || name === userName))
      && partnerEmail !== userEmail && userName !== partnerName
    );
  }

  handleSubmit = (values) => {
    const { onSubmit } = this.props;
    onSubmit(values);
  };

  handleShowForm = () => {
    const { userForm } = this.state;
    userForm.showForm = true;
    this.setState({ userForm });
  }

  handleUserSubmit = (addUserForm, partnerForm) => {
    const { userForm } = this.state;
    const { values, setSubmitting, resetForm } = addUserForm;
    const { setFieldValue, values: { users } } = partnerForm;
    setSubmitting(true);
    if (this.shouldAddUser(values, partnerForm.values)) {
      users.push(values);
      setFieldValue('users', users);
      setSubmitting(false);
      this.setState({ userForm: { userSubmitError: false, showForm: false } });
      resetForm();
    } else {
      this.setState({ userForm: { ...userForm, userSubmitError: 'E-mail i nazwa muszą byc unikatowe!' } });
      setSubmitting(false);
    }
  }

  render() {
    const {
      alertDialog, partnerInitialValues,
      userInitialValues, userForm: { userSubmitError, showForm },
    } = this.state;
    const { classes, FormikProps } = this.props;
    return (
      <Formik
        {...FormikProps}
        initialValues={partnerInitialValues}
        validationSchema={this.partnerValidationSchema}
        onSubmit={this.handleSubmit}
        enableReinitialize
      >
        { partnerForm => (
          <>
            <Form autoComplete="off" noValidate>
              <Grid container spacing={16}>
                <GridItem>
                  <Typography variant="h6">Dane partnera</Typography>
                </GridItem>
                <GridItem>
                  <Field name="email" label="E-mail partnera" required component={TextField} {...commonProps} />
                </GridItem>
                <GridItem>
                  <Field name="name" label="Nazwa partnera" required component={TextField} {...commonProps} />
                </GridItem>
                <GridItem>
                  <Field name="commission" type="number" label="Prowizja (%)" required component={TextField} {...commonProps} />
                </GridItem>
                <GridItem>
                  <Field name="p24MerchantId" label="Przelewy24 Merchant Id" required component={TextField} {...commonProps} />
                </GridItem>
                <GridItem>
                  <Field name="affiliateCode" label="Kod afiliacyjny" component={TextField} {...commonProps} />
                </GridItem>
                <GridItem className={classes.sectionWrapper}>
                  <Grid item container xs={12} justify="space-between">
                    <Typography variant="h6">Bileterzy</Typography>
                    <Button variant="outlined" onClick={this.handleShowForm}>Nowy bileter</Button>
                  </Grid>
                  <FieldArray
                    name="users"
                    render={
                    arrayHelpers => (
                      <List dense>
                        {
                          partnerForm.values.users.length > 0
                            ? (
                              partnerForm.values.users.map(({ email, name }, i) => (
                                <div key={email}>
                                  <ListItem>
                                    <ListItemText primary={name} secondary={email} />
                                    <ListItemSecondaryAction>
                                      <IconButton
                                        onClick={
                                          () => {
                                            this.handleRemoveUserDialogOpen(
                                              () => arrayHelpers.remove(i),
                                            );
                                          }
                                        }
                                      >
                                        <IconClear />
                                      </IconButton>
                                    </ListItemSecondaryAction>
                                  </ListItem>
                                  <Divider />
                                </div>
                              ))
                            ) : (
                              <Grid container alignItems="center">
                                <IconBlock />
                                <Typography variant="subtitle2">Brak bileterów</Typography>
                              </Grid>
                            )
                        }
                      </List>
                    )}
                  />
                </GridItem>
              </Grid>
            </Form>
            <Formik
              initialValues={userInitialValues}
              validationSchema={this.userValidationSchema}
            >
              {userForm => (
                showForm
                && (
                  <Form
                    className={classes.sectionWrapper}
                    onSubmit={(e) => {
                      e.preventDefault();
                      this.handleUserSubmit(userForm, partnerForm);
                    }
                    }
                  >
                    <Grid container spacing={16} justify="flex-end">
                      <GridItem>
                        <Typography variant="h6">Nowy bileter</Typography>
                      </GridItem>
                      <GridItem>
                        <Field name="email" label="E-mail Biletera" required component={TextField} {...commonProps} />
                      </GridItem>
                      <GridItem>
                        <Field name="name" label="Nazwa Biletera" required component={TextField} {...commonProps} />
                      </GridItem>
                      <Grid item container xs={12} spacing={16} direction="row-reverse" justify="space-between">
                        <Grid container item justify="space-between" xs={2}>
                          <Button variant="contained" color="primary" onClick={() => this.handleDiscard(userForm)}>Anuluj</Button>
                          <Button type="submit" variant="contained" color="primary">Dodaj</Button>
                        </Grid>
                        <Grid item xs={8}>
                          {
                            userSubmitError
                            && <Typography className={classes.error}>{userSubmitError}</Typography>
                          }
                        </Grid>
                      </Grid>
                    </Grid>
                  </Form>
                )
              )}
            </Formik>
            <AlertDialog {...alertDialog} onCancel={this.handleClose} />
          </>
        )}
      </Formik>
    );
  }
}

AddPartnerForm.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  FormikProps: PropTypes.shape({}),
  onSubmit: PropTypes.func,
  onSubmitFailure: PropTypes.func,
  onSubmitSuccess: PropTypes.func,
};

AddPartnerForm.defaultProps = {
  FormikProps: null,
  onSubmit: null,
  onSubmitFailure: null,
  onSubmitSuccess: null,
};

export default withStyles(styles)(AddPartnerForm);
