import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import {
  Formik, Form, Field,
} from 'formik';
import Grid from '@material-ui/core/Grid';
import GridItem from 'components/GridItem';
import { TextField } from 'formik-material-ui';
import Typography from '@material-ui/core/Typography/Typography';
import yupObject from 'yup/lib/object';
import yupString from 'yup/lib/string';

const commonProps = {
  fullWidth: true,
};

class UserForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialValues: {
        email: '',
        name: '',
        roles: ['USHER'],
      },
    };

    this.validationSchema = yupObject().shape({
      email: yupString().email().trim().required(),
      name: yupString().required(),
    });
  }

  render() {
    const { initialValues } = this.state;
    const {
      error, FormikProps, onDiscard, onSubmit,
    } = this.props;
    return (
      <Formik
        {...FormikProps}
        initialValues={initialValues}
        validationSchema={this.userValidationSchema}
        enableReinitialize
      >
        {() => (
          <Form>
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
                  <Button variant="contained" color="primary" onClick={onDiscard}>Anuluj</Button>
                  <Button variant="contained" color="primary" onClick={onSubmit}>Dodaj</Button>
                </Grid>
                <Grid item xs={8}>
                  {
                    error
                    && <Typography style={{ color: 'red' }}>{error}</Typography>
                  }
                </Grid>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    );
  }
}

UserForm.propTypes = {
  error: PropTypes.string.isRequired,
  FormikProps: PropTypes.shape({}),
  onDiscard: PropTypes.func,
  onSubmit: PropTypes.func,
};

UserForm.defaultProps = {
  FormikProps: null,
  onDiscard: null,
  onSubmit: null,
};

export default UserForm;
