import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import IconClear from '@material-ui/icons/Clear';
import IconBlock from '@material-ui/icons/Block';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography/Typography';
import GridItem from 'components/GridItem';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import yupObject from 'yup/lib/object';
import yupString from 'yup/lib/string';
import AlertDialog from 'components/AlertDialog';
import { ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';


const commonProps = {
  fullWidth: true,
};

const styles = () => ({
  list: {
    marginBottom: 15,
  },
});

const initialDialogState = {
  content: null,
  onSuccess: null,
  open: false,
  title: null,
};

class AddUserForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alertDialog: initialDialogState,
      initialValues: {
        email: '',
        name: '',
        roles: ['USHER'],
      },
      showForm: false,
    };
    // TODO: nested validation seems not working
    // TODO: see https://github.com/jaredpalmer/formik/issues/986
    this.validationSchema = yupObject().shape({
      email: yupString().email().trim().required(),
      name: yupString().required(),
    });
  }

  handleClose = () => this.setState({ alertDialog: initialDialogState });

  handleSubmit = (values) => {
    const { onSubmit } = this.props;
    onSubmit(values);
    this.setState({ showForm: false });
  };

  handleRemoveUserDialogOpen = (email) => {
    const { handleRemove } = this.props;
    this.setState({
      alertDialog: {
        content: 'Czy jesteś pewnien?',
        title: 'Usuwanie użytkownika',
        open: true,
        onSuccess: () => {
          this.handleClose();
          handleRemove(email);
        },
      },
    });
  }

  handleDiscard = (resetForm) => {
    resetForm();
    this.setState({ showForm: false });
  }

  render() {
    const { alertDialog, initialValues, showForm } = this.state;
    const { classes, FormikProps, users } = this.props;
    return (
      <Formik
        enableReinitialize
        {...FormikProps}
        initialValues={initialValues}
        validationSchema={this.validationSchema}
        onSubmit={this.handleSubmit}
      >
        {({ resetForm }) => (
          <Grid container spacing={16}>
            <Grid item container xs={12} justify="space-between">
              <Typography variant="h6">Bileterzy</Typography>
              <Button variant="outlined" onClick={() => this.setState({ showForm: true })}>Nowy bileter</Button>
            </Grid>
            <Grid item xs={12}>
              <List className={classes.list} dense>
                {
                  users.length > 0
                    ? (
                      users.map(({ email, name }) => (
                        <div key={email}>
                          <ListItem>
                            <ListItemText primary={name} secondary={email} />
                            <ListItemSecondaryAction>
                              <IconButton onClick={() => this.handleRemoveUserDialogOpen(email)}>
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
            </Grid>
            <Grid item xs={12}>
              {
                showForm
                && (
                  <Form autoComplete="off">
                    <Grid container spacing={16} justify="flex-end">
                      <GridItem>
                        <Field name="email" label="E-mail Biletera" required component={TextField} {...commonProps} />
                      </GridItem>
                      <GridItem>
                        <Field name="name" label="Nazwa Biletera" required component={TextField} {...commonProps} />
                      </GridItem>
                      <Grid container item justify="space-between" xs={2}>
                        <Button variant="contained" color="primary" onClick={() => this.handleDiscard(resetForm)}>Anuluj</Button>
                        <Button type="submit" variant="contained" color="primary">Dodaj</Button>
                      </Grid>
                    </Grid>
                  </Form>
                )
              }
            </Grid>
            <AlertDialog {...alertDialog} onCancel={this.handleClose} />
          </Grid>
        )}
      </Formik>
    );
  }
}

AddUserForm.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  handleRemove: PropTypes.func.isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  FormikProps: PropTypes.shape({}),
  onSubmit: PropTypes.func.isRequired,
};

AddUserForm.defaultProps = {
  FormikProps: null,
};

export default compose(
  withStyles(styles),
)(AddUserForm);
