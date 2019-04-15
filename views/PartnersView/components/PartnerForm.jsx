import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import {
  Formik, Form, Field, FieldArray,
} from 'formik';
import { TextField } from 'formik-material-ui';
import yupObject from 'yup/lib/object';
import yupString from 'yup/lib/string';
import yupNumber from 'yup/lib/number';
import GridItem from 'components/GridItem';
import { actions as partnersActions } from 'redux/partners';
import UserList from './UserList';

const commonProps = {
  fullWidth: true,
};

const styles = {
  sectionWrapper: {
    marginTop: 40,
  },
};

class AddPartnerForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initialValues: {
        email: '',
        name: '',
        commission: 0,
        p24MerchantId: '',
        affiliateCode: '',
        users: [],
      },
    };

    this.validationSchema = yupObject().shape({
      email: yupString().email().trim().required(),
      name: yupString().required(),
      commission: yupNumber().min(0).max(100).required(),
      p24MerchantId: yupString().required(),
      affiliateCode: yupString(),
    });
  }


  handleSubmit = (values) => {
    const { onSubmit } = this.props;
    onSubmit(values);
  };

  handleSubmit = (values, actions) => {
    const { createPartner, onSuccess, onFailure } = this.props;
    const { resetForm, setSubmitting } = actions;
    createPartner({
      data: {
        ...values,
      },
      onSuccess: () => {
        resetForm();
        onSuccess();
      },
      onFailure: () => {
        setSubmitting(false);
        onFailure();
      },
    });
  }

  render() {
    const { initialValues } = this.state;
    const { classes, FormikProps, listAction } = this.props;
    return (
      <Formik
        {...FormikProps}
        initialValues={initialValues}
        validationSchema={this.validationSchema}
        onSubmit={this.handleSubmit}
        enableReinitialize
      >
        { form => (
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
                  {
                    listAction
                    && <Button variant="outlined" onClick={listAction}>Nowy bileter</Button>
                  }
                </Grid>
                <FieldArray
                  name="users"
                  render={
                    arrayHelpers => (
                      <UserList users={form.values.users} actions={arrayHelpers} />
                    )}
                />
              </GridItem>
            </Grid>
          </Form>
        )}
      </Formik>
    );
  }
}

AddPartnerForm.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  createPartner: PropTypes.func.isRequired,
  FormikProps: PropTypes.shape({}),
  listAction: PropTypes.func,
  onSubmit: PropTypes.func,
  onFailure: PropTypes.func,
  onSuccess: PropTypes.func,
};

AddPartnerForm.defaultProps = {
  FormikProps: null,
  listAction: null,
  onSubmit: null,
  onFailure: null,
  onSuccess: null,
};

const mapDispatchToProps = {
  createPartner: partnersActions.createItem,
};

export default compose(
  withStyles(styles),
  connect(null, mapDispatchToProps),
)(AddPartnerForm);
