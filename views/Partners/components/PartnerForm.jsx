import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import { Formik, Form, Field } from 'formik';
import { CheckboxWithLabel, Select, TextField } from 'formik-material-ui';
import yupObject from 'yup/lib/object';
import yupString from 'yup/lib/string';
import yupNumber from 'yup/lib/number';
import GridItem from 'components/GridItem';
import { actions as partnersActions } from 'redux/partners';

const commonProps = {
  fullWidth: true,
};

const businesTypes = [
  { label: 'Osoba fizyczna', value: 1 },
  { label: 'Jednoosobowa działalność gospodarcza', value: 2 },
  { label: 'Spółka cywilna', value: 3 },
  { label: 'Spółka jawna', value: 4 },
  { label: 'Spółka komandytowa', value: 5 },
  { label: 'Spółka komandytowo-akcyjna', value: 6 },
  { label: 'Spółka akcyjna', value: 7 },
  { label: 'Spółka z ograniczoną odpowiedzialnością', value: 8 },
  { label: 'Stowarzyszenie, fundacja, organizacja pożytku publicznego', value: 9 },
  { label: 'Spółdzielnia', value: 10 },
];

const styles = {
  formControl: {
    width: '100%',
  },
  section: {
    marginTop: 40,
  },
};

class AddPartnerForm extends Component {
  constructor(props) {
    super(props);

    this.initialValues = {
      address: {
        city: '',
        country: 'PL',
        street: '',
        zipCode: '',
      },
      affiliateCode: false,
      bankAccount: '',
      businessType: '',
      commission: '',
      contact: {
        email: '',
        name: '',
        phone: '',
      },
      email: '',
      employerId: '',
      invoiceEmail: '',
      name: '',
      phone: '',
      serviceDescription: '',
      socialNumber: '',
      natoinalCourtRegister: '',
      taxNumber: '',
    };

    this.validationSchema = yupObject().shape({
      commission: yupNumber().min(0).max(100).required(),
      email: yupString().email().trim().required(),
      name: yupString().required(),
      affiliateCode: yupString(),
    });
  }

  handleBusinessTypeChange = actions => (event) => {
    const { setFieldValue } = actions;
    const { name, value } = event.target;

    setFieldValue(name, value);

    if (value === 1) {
      setFieldValue('taxNumber', '');
      setFieldValue('employerId', '');
      setFieldValue('natoinalCourtRegister', '');
    } else {
      setFieldValue('socialNumber', '');
    }

    if (value > 1 && value < 4) {
      setFieldValue('natoinalCourtRegister', '');
    }
  };

  handleChange = fieldName => event => this.setState({ [fieldName]: event.target.value });

  handleSubmit = (values, actions) => {
    const { onSubmit } = this.props;

    if (onSubmit) {
      onSubmit(values, actions);

      return;
    }

    const { createPartner } = this.props;
    const payload = {
      data: values,
      onFailure: this.handleSubmitFailure(actions),
      onSuccess: this.handleSubmitSuccess(actions),
    };

    createPartner(payload);
  };

  handleSubmitFailure = actions => () => {
    const { onSubmitFailure } = this.props;

    if (onSubmitFailure) {
      onSubmitFailure(actions);
    }

    const { setSubmitting } = actions;

    setSubmitting(false);
  };

  handleSubmitSuccess = actions => (sightId) => {
    const { onSubmitSuccess } = this.props;

    if (onSubmitSuccess) {
      onSubmitSuccess(sightId, actions);

      return;
    }

    const { resetForm, setSubmitting } = actions;

    setSubmitting(false);
    resetForm();
  };

  render() {
    const { buttons, classes, FormikProps } = this.props;

    return (
      <Formik
        {...FormikProps}
        initialValues={this.initialValues}
        // validationSchema={this.validationSchema}
        onSubmit={this.handleSubmit}
      >
        { ({ isSubmitting, values, setFieldValue } = {}) => (
          <Form autoComplete="off" noValidate>
            <Grid container spacing={16}>
              <GridItem>
                <Typography variant="h6">Dane partnera</Typography>
              </GridItem>
              <GridItem>
                <Field name="name" label="Nazwa" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem>
                <Field name="address.street" label="Ulica" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={3} sm={3}>
                <Field name="address.zipCode" label="Kod pocztowy" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={6} sm={6}>
                <Field name="address.city" label="Miasto" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={3} sm={3}>
                <FormControl className={classes.formControl} required>
                  <InputLabel htmlFor="address-country">Kraj</InputLabel>
                  <Field
                    component={Select}
                    inputProps={{
                      id: 'address-country',
                      name: 'address.country',
                    }}
                    name="address.country"
                    required
                  >
                    <MenuItem value="PL">Polska</MenuItem>
                  </Field>
                </FormControl>
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="phone" type="tel" label="Telefon" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="email" type="email" label="E-mail (login partnera)" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem className={classes.section}>
                <Typography variant="h6">Informacje o działalności</Typography>
              </GridItem>
              <GridItem md={3} sm={3}>
                <FormControl className={classes.formControl} required>
                  <InputLabel htmlFor="business-type">Rodzaj działalności</InputLabel>
                  <Field
                    component={Select}
                    inputProps={{
                      id: 'business-type',
                      name: 'businessType',
                      onChange: this.handleBusinessTypeChange({ setFieldValue }),
                    }}
                    name="businessType"
                    required
                  >
                    {businesTypes.map(({ label, value }) => (
                      <MenuItem key={label} value={value}>{label}</MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </GridItem>
              {values.businessType && values.businessType !== 1
                && (
                  <Fragment>
                    <GridItem md={3} sm={3}>
                      <Field name="taxNumber" label="NIP" required component={TextField} {...commonProps} />
                    </GridItem>
                    <GridItem md={3} sm={3}>
                      <Field name="employerId" label="REGON" required component={TextField} {...commonProps} />
                    </GridItem>
                  </Fragment>
                )
              }
              {values.businessType && values.businessType > 3
                && (
                  <GridItem md={3} sm={3}>
                    <Field name="natoinalCourtRegister" label="KRS" required component={TextField} {...commonProps} />
                  </GridItem>
                )
              }
              {values.businessType && values.businessType === 1
                && (
                  <GridItem md={3} sm={3}>
                    <Field name="socialNumber" label="PESEL" required component={TextField} {...commonProps} />
                  </GridItem>
                )
              }
              <GridItem className={classes.section}>
                <Typography variant="h6">Osoba reprezentująca</Typography>
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="contact.name" label="Imię i nazwisko" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="contact.phone" type="tel" label="Telefon" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="contact.email" type="email" label="E-mail" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem className={classes.section}>
                <Typography variant="h6">Płatności</Typography>
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="bankAccount" label="Konto bankowe" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="invoiceEmail" type="email" label="E-mail do faktur" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4} />
              <GridItem md={4} sm={4}>
                <Field name="commission" type="number" label="Prowizja (%)" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem container md={4} sm={4} alignItems="flex-end">
                <Field
                  name="affiliateCode"
                  Label={{ label: 'Generuj kod afiliacyjny' }}
                  component={CheckboxWithLabel}
                />
              </GridItem>
              <GridItem md={4} sm={4} />
              <GridItem className={classes.section}>
                <Typography variant="h6">Przelewy24</Typography>
              </GridItem>
              <GridItem>
                <Field name="serviceDescription" label="Opis usługi" required component={TextField} {...commonProps} />
              </GridItem>
            </Grid>
            {buttons
              && (
              <Grid container spacing={16} justify="flex-end" className={classes.section}>
                <GridItem container md={3} sm={3} justify="flex-end">
                  <Button variant="contained" color="primary" type="submit" disabled={isSubmitting}>
                    Zapisz
                  </Button>
                </GridItem>
              </Grid>
              )
            }
          </Form>
        )}
      </Formik>
    );
  }
}

AddPartnerForm.propTypes = {
  buttons: PropTypes.bool,
  classes: PropTypes.shape({}).isRequired,
  createPartner: PropTypes.func.isRequired,
  FormikProps: PropTypes.shape({}),
  onSubmit: PropTypes.func,
  onSubmitFailure: PropTypes.func,
  onSubmitSuccess: PropTypes.func,
};

AddPartnerForm.defaultProps = {
  buttons: true,
  FormikProps: null,
  onSubmit: null,
  onSubmitFailure: null,
  onSubmitSuccess: null,
};

const mapDispatchToProps = {
  createPartner: partnersActions.createItem,
};

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles),
)(AddPartnerForm);
