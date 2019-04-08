import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import IconClear from '@material-ui/icons/Clear';
import IconBlock from '@material-ui/icons/Block';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography/Typography';
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

class AddTicketerForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alertDialog: initialDialogState,
      initialValues: {
        email: '',
      },
    };
    // TODO: nested validation seems not working
    // TODO: see https://github.com/jaredpalmer/formik/issues/986
    this.validationSchema = yupObject().shape({
      email: yupString().email().trim(),
    });
  };

  handleClose = () => this.setState({ alertDialog: initialDialogState });

  handleSubmit = (values) => {
    const { onSubmit } = this.props;
    onSubmit(values.email);
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
      }
    })
  }

  render() {
    const { alertDialog, initialValues } = this.state;
    const { classes, FormikProps, users } = this.props;
    return (
      <Formik
        enableReinitialize
        {...FormikProps}
        initialValues={initialValues}
        validationSchema={this.validationSchema}
        onSubmit={this.handleSubmit}
      >
        {() => (
          <>
            <Typography variant="h6">Bileterzy</Typography>
            <List className={classes.list}>
              {
                users.length > 0
                  ? (
                    users.map(({ email }) => (
                      <div key={email}>
                        <ListItem>
                          <ListItemText primary={email} />
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
                    <Grid container justify="center" alignItems="center">
                      <IconBlock />
                      <Typography variant="subtitle2">Brak bileterów</Typography>
                    </Grid>
                  )
              }
            </List>
            <Form autoComplete="off" align="flex-start">
              <Grid container spacing={24}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Dodaj biletera</Typography>
                </Grid>
                <Grid container item xs={12} alignItems="flex-end" spacing={16}>
                  <Grid item xs={10}>
                    <Field name="email" label="E-mail Biletera" required component={TextField} {...commonProps} />
                  </Grid>
                  <Grid item xs={2}>
                    <Button type="submit" variant="contained" color="primary">Dodaj</Button>
                  </Grid>
                </Grid>
              </Grid>
            </Form>
            <AlertDialog {...alertDialog} onCancel={this.handleClose} />
          </>
        )}
      </Formik>
    );
  }
}

AddTicketerForm.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  handleRemove: PropTypes.func.isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  FormikProps: PropTypes.shape({}),
  onSubmit: PropTypes.func.isRequired,
};

AddTicketerForm.defaultProps = {
  FormikProps: null,
};

export default compose(
  withStyles(styles),
)(AddTicketerForm);
