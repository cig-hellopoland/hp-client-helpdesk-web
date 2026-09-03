import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _isEqual from 'lodash/isEqual';
import _isNumber from 'lodash/isNumber';
import _merge from 'lodash/merge';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import { Formik, Form, Field } from 'formik';
import { CheckboxWithLabel, Select, TextField } from 'formik-material-ui';
import yupBoolean from 'yup/lib/boolean';
import yupNumber from 'yup/lib/number';
import yupObject from 'yup/lib/object';
import yupString from 'yup/lib/string';
import {
  actions as partnersActions,
  selectors as partnersSelectors,
} from 'redux/partners';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import GridItem from 'components/GridItem';
import VoivodeshipSelect, { POLISH_VOIVODESHIPS } from 'components/VoivodeshipSelect';
import getPartnerErrorMessage from '../../utils/partnerErrorMessage';
import config from '../../../../../config';

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
  { label: 'Instytucja Kultury', value: 11 },
  { label: 'Jednostka Samorządu Terytorialnego', value: 12 },
];

// TODO: remove this function and change Switch implementation after it's fixed.
// TODO: see https://github.com/stackworx/formik-material-ui/pull/42
const fieldToSwitch = ({
  field,
  form: { isSubmitting },
  disabled = false,
  ...props
}) => ({
  disabled: isSubmitting || disabled,
  ...props,
  ...field,
  value: field.name,
  checked: field.value,
});

const styles = theme => ({
  errorBox: {
    backgroundColor: '#ffebee',
    borderLeft: `4px solid ${theme.palette.error.main}`,
    padding: theme.spacing.unit * 2,
    width: '100%',
  },
  formControl: {
    width: '100%',
  },
  section: {
    marginTop: 40,
  },
});

class PartnerCompanyForm extends Component {
  constructor(props) {
    super(props);

    const { initialValues } = this.props;

    this.state = {
      initialValues: this.getInitialValues(initialValues || {}),
    };

    this.validationSchema = yupObject().shape({
      affiliation: yupBoolean().required('Określ, czy wygenerować kod afiliacyjny.'),
      bankAccount: yupString().trim(),
      businessType: yupNumber()
        .transform((v, orig) => (orig === '' || orig == null ? undefined : Number(orig)))
        .typeError('Wybierz rodzaj działalności.')
        .required('Wybierz rodzaj działalności.'),
      commission: yupNumber()
        .transform((v, orig) => (orig === '' || orig == null ? undefined : Number(orig)))
        .typeError('Prowizja musi być liczbą.')
        .min(0, 'Prowizja nie może być mniejsza niż 0%.')
        .max(100, 'Prowizja nie może być większa niż 100%.')
        .required('Podaj prowizję.'),
      contactPerson: yupObject().shape({
        email: yupString().email('Wpisz poprawny adres e-mail.').trim().required('Podaj adres e-mail osoby reprezentującej.'),
        name: yupString().required('Podaj imię i nazwisko osoby reprezentującej.'),
        phone: yupString().trim().required('Podaj telefon osoby reprezentującej.'),
      }),
      email: yupString().email('Wpisz poprawny adres e-mail.').trim().required('Podaj adres e-mail partnera.'),
      invoiceEmail: yupString().email('Wpisz poprawny adres e-mail.').trim(),
      krs: yupString().when('businessType', {
        is: businessType => Number(businessType) > 3
          && Number(businessType) !== 11
          && Number(businessType) !== 12,
        then: yupString().required('Podaj numer KRS.'),
        otherwise: yupString().nullable(true),
      }),
      location: yupObject().shape({
        city: yupString().required('Podaj miejscowość.'),
        country: yupString().required('Wybierz kraj.'),
        street: yupString().required('Podaj ulicę i numer.'),
        voivodeship: yupString()
          .oneOf(POLISH_VOIVODESHIPS, 'Wybierz województwo z listy.')
          .required('Wybierz województwo.'),
        zipCode: yupString().required('Podaj kod pocztowy.'),
      }),
      name: yupString().required('Podaj nazwę partnera.'),
      phone: yupString().trim(),
      regon: yupString().when('businessType', {
        is: businessType => businessType > 1,
        then: yupString().required('Podaj numer REGON.'),
      }),
      servicesDescription: yupString(),
      socialNumber: yupString().when('businessType', {
        is: businessType => businessType === 1,
        then: yupString().required('Podaj numer PESEL.'),
      }),
      taxNumber: yupString().when('businessType', {
        is: businessType => businessType > 1,
        then: yupString().required('Podaj numer NIP.'),
      }),
    });
  }

  componentDidUpdate(prevProps) {
    const { initialValues: prevInitialValues } = prevProps;
    const { initialValues } = this.props;

    if (!_isEqual(prevInitialValues, initialValues)) {
      this.setInitialValues(initialValues);
    }
  }

  getInitialValues = (initialValues) => {
    const {
      contactPerson: initialContactPerson, location: initialLocation, ...details
    } = initialValues || {};
    const contactPerson = initialContactPerson || {};
    const location = initialLocation || {};

    return {
      id: details.id || '',
      affiliation: details.affiliation == null ? true : details.affiliation,
      bankAccount: details.bankAccount || '',
      blocked: details.blocked || false,
      businessType:
        details.businessType != null && details.businessType !== ''
          ? Number(details.businessType)
          : '',
      commission:
        details.commission != null && details.commission !== ''
          ? Number(details.commission)
          : 0,
      contactPerson: {
        email: contactPerson.email || '',
        name: contactPerson.name || '',
        phone: contactPerson.phone || '',
      },
      email: details.email || '',
      invoiceEmail: details.invoiceEmail || '',
      krs: details.krs || '',
      location: {
        city: location.city || '',
        country: location.country || 'PL',
        street: location.street || '',
        zipCode: location.zipCode || '',
        commune: location.commune || '',
        county: location.county || '',
        voivodeship: location.voivodeship
          ? location.voivodeship.toLocaleLowerCase('pl')
          : '',
      },
      name: details.name || '',
      phone: details.phone || '',
      regon: details.regon || '',
      servicesDescription: details.servicesDescription || '',
      socialNumber: details.socialNumber || '',
      taxNumber: details.taxNumber || '',
    };
  };

  setInitialValues = initialValues => this.setState({
    initialValues: this.getInitialValues(initialValues || {}),
  });

  getParsedValues = (values) => {
    const {
      krs, regon, taxNumber, socialNumber, ...parsedValues
    } = values;

    if (values.businessType === 1) {
      parsedValues.socialNumber = socialNumber;
    } else {
      parsedValues.regon = regon;
      parsedValues.taxNumber = taxNumber;
    }

    if (values.businessType > 3 && values.businessType !== 11 && values.businessType !== 12) {
      parsedValues.krs = krs;
    }

    return parsedValues;
  };

  handleBusinessTypeChange = actions => (event) => {
    const { setFieldValue } = actions;
    const { name, value } = event.target;
    const numValue = Number(value);

    //setFieldValue(name, value);
    setFieldValue(name, numValue);

    //if (value === 1) {
    if (numValue === 1) {
      setFieldValue('taxNumber', '');
      setFieldValue('regon', '');
      setFieldValue('krs', '');
    } else {
      setFieldValue('socialNumber', '');
    }

    //if (value > 1 && value < 4) {
    if (numValue > 1 && numValue < 4) {
      setFieldValue('krs', '');
    }

    if (numValue === 11 || numValue === 12) {
      setFieldValue('krs', '');
    }
  };

  handleChange = fieldName => event => this.setState({ [fieldName]: event.target.value });

  handleSubmit = (values, actions) => {
    const {
      clearError, initialValues, language, onResetEmailSuccess, onSubmit,
    } = this.props;

    clearError();

    // businessType może być liczbą albo obiektem {label, value}
    const bt =
      values.businessType && values.businessType.value != null
        ? values.businessType.value
        : values.businessType;

    const parsedValues = this.getParsedValues({
      ...values,
      businessType: Number(bt),
    });

    // dla pewności po parserze jeszcze raz twardo ustawiamy liczbę
    parsedValues.businessType = Number(bt);

    if (onSubmit) {
      onSubmit(parsedValues, actions);
      return;
    }

    const { createItem, updateItem } = this.props;
    const { id, ...data } = parsedValues;

    const payload = {
      data,
      options: {
        headers: {
          'Content-Language': language,
        },
      },
      onFailure: this.handleSubmitFailure(actions),
      onSuccess: this.handleSubmitSuccess(actions),
    };

    let submitAction = createItem;

    if (_isNumber(id)) {
      payload.data.id = id;

      submitAction = updateItem;
      payload.id = id;
      const initialEmail = String((initialValues && initialValues.email) || '').trim().toLowerCase();
      const currentEmail = String(data.email || '').trim().toLowerCase();
      const emailChanged = initialEmail !== currentEmail;
      payload.data = _merge({}, initialValues, data);
      if (emailChanged && onResetEmailSuccess) {
        payload.data.email = initialValues.email;
        payload.onSuccess = this.handleSubmitAndResetEmailSuccess(actions, id, data.email);
      }
      payload.pathParams = {
        languageVersion: language,
      };
    }

    submitAction(payload);
  };

  handleSubmitAndResetEmailSuccess = (actions, partnerId, email) => () => {
    const { onResetEmailSuccess } = this.props;

    onResetEmailSuccess({
      email,
      partnerId,
      onFailure: this.handleSubmitFailure(actions),
      onSuccess: this.handleSubmitSuccess(actions),
    });
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
    const { onSubmitSuccess, clearError } = this.props;

    if (onSubmitSuccess) {
      onSubmitSuccess(sightId, actions);

      return;
    }

    const { resetForm, setSubmitting } = actions;
    clearError();
    setSubmitting(false);
    resetForm();
  };

  render() {
    const {
      classes, disabled, requestError, FormikProps, hideButtons, hideErrors,
    } = this.props;
    const { initialValues } = this.state;
    const errorMessage = getPartnerErrorMessage(requestError);
    const { brandName } = (config && config.public) || {};

    return (
      <Formik
        enableReinitialize
        {...FormikProps}
        disabled={disabled}
        initialValues={initialValues}
        validationSchema={this.validationSchema}
        onSubmit={this.handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue, errors, isValid, submitCount } = {}) => {
          const bt = Number(values.businessType);
          return (
          <Form autoComplete="off" noValidate>
            <Grid container spacing={16}>
              <GridItem>
                <Typography variant="h6">Dane partnera</Typography>
                {/*{values.id
                  && (
                    <Typography color="error">
                      {`UWAGA: Modyfikujesz dane w systemie ${brandName}. Upewnij się, że partner zaktualizuje je w Przelewach24.`}
                    </Typography>
                  )
                }*/}
              </GridItem>
              <GridItem>
                <Field disabled={disabled} name="name" label="Nazwa" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field
                  name="blocked"
                  render={switchProps => (
                    <FormControlLabel
                      control={<Switch {...fieldToSwitch(switchProps)} />}
                      disabled={disabled}
                      label="Blokuj"
                    />
                  )}
                />
              </GridItem>
              <GridItem>
                <Field disabled={disabled} name="location.street" label="Ulica" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={3} sm={3}>
                <Field disabled={disabled} name="location.zipCode" label="Kod pocztowy" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={6} sm={6}>
                <Field disabled={disabled} name="location.city" label="Miasto" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={3} sm={3}>
                <FormControl className={classes.formControl} required>
                  <InputLabel
                    disabled={disabled}
                    htmlFor="location-country"
                    shrink={!!(values.location && values.location.country)}
                  >
                    Kraj
                  </InputLabel>
                  <Field
                    component={Select}
                    disabled={disabled}
                    inputProps={{
                      id: 'location-country',
                      name: 'location.country',
                    }}
                    name="location.country"
                    required
                  >
                    <MenuItem value="PL">Polska</MenuItem>
                  </Field>
                </FormControl>
              </GridItem>
              <GridItem md={4} sm={4}>
                <VoivodeshipSelect disabled={disabled} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="location.county" label="Powiat" component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field name="location.commune" label="Gmina" component={TextField} {...commonProps}/>
              </GridItem>

              <GridItem md={4} sm={4}>
                <Field disabled={disabled} name="phone" type="tel" label="Telefon" component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field disabled={disabled} name="email" type="email" label="E-mail (login partnera)" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem className={classes.section}>
                <Typography variant="h6">Informacje o działalności</Typography>
              </GridItem>
              <GridItem md={3} sm={3}>
                <FormControl className={classes.formControl} required>
                  <InputLabel htmlFor="business-type" shrink={!!values.businessType}>
                    Rodzaj działalności
                  </InputLabel>
                  <Field
                    component={Select}
                    disabled={disabled}
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
              {bt && bt !== 1 && (
                  <Fragment>
                    <GridItem md={3} sm={3}>
                      <Field disabled={disabled} name="taxNumber" label="NIP" helperText="Format: tylko cyfry, bez spacji" required component={TextField} {...commonProps} />
                    </GridItem>
                    <GridItem md={3} sm={3}>
                      <Field disabled={disabled} name="regon" label="REGON" required component={TextField} {...commonProps} />
                    </GridItem>
                  </Fragment>
                )
              }
              {bt && bt > 3 && bt !== 11 && bt !== 12 && (
                  <GridItem md={3} sm={3}>
                    <Field disabled={disabled} name="krs" label="KRS" required component={TextField} {...commonProps} />
                  </GridItem>
                )}
              {bt === 1 &&  (
                  <GridItem md={3} sm={3}>
                    <Field disabled={disabled} name="socialNumber" label="PESEL" required component={TextField} {...commonProps} />
                  </GridItem>
                )
              }
              <GridItem className={classes.section}>
                <Typography variant="h6">Osoba reprezentująca</Typography>
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field disabled={disabled} name="contactPerson.name" label="Imię i nazwisko" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field disabled={disabled} name="contactPerson.phone" type="tel" label="Telefon" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field disabled={disabled} name="contactPerson.email" type="email" label="E-mail" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem className={classes.section}>
                <Typography variant="h6">Płatności</Typography>
              </GridItem>
             {/* <GridItem md={4} sm={4}>
                <Field disabled={disabled} name="bankAccount" label="Konto bankowe" helperText="Format: tylko cyfry, bez spacji" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4}>
                <Field disabled={disabled} name="invoiceEmail" type="email" label="E-mail do faktur" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem md={4} sm={4} />*/}
              <GridItem md={4} sm={4}>
                <Field disabled={disabled} name="commission" type="number" label="Prowizja (%)" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem container md={4} sm={4} alignItems="flex-end">
                <Field
                  disabled={disabled}
                  name="affiliation"
                  Label={{ label: 'Generuj kod afiliacyjny' }}
                  component={CheckboxWithLabel}
                />
              </GridItem>
              <GridItem md={4} sm={4} />
              {/*<GridItem className={classes.section}>
                <Typography variant="h6">Przelewy24</Typography>
              </GridItem>
              <GridItem>
                <Field disabled={disabled} name="servicesDescription" label="Opis usługi partnera" required component={TextField} {...commonProps} />
              </GridItem> */}
            </Grid>
            {(!hideButtons || (!hideErrors && errorMessage))
              && (
                <Grid container spacing={16} justify="flex-end" className={classes.section}>
                  {!hideErrors && errorMessage
                    && (
                      <GridItem md={9} sm={9}>
                        <div className={classes.errorBox} role="alert" aria-live="assertive">
                          <Typography color="error" variant="subtitle1">
                            Nie udało się zapisać danych partnera
                          </Typography>
                          <Typography color="error">{errorMessage}</Typography>
                        </div>
                      </GridItem>
                    )
                  }
                  {!hideButtons
                    && (
                      <GridItem container md={3} sm={3} justify="flex-end">
                        <Button variant="contained" color="primary" type="submit" disabled={isSubmitting} >
                          Zapisz
                        </Button>
                      </GridItem>
                    )
                  }
                </Grid>
              )
            }
          </Form>
        );
       }}
      </Formik>
    );
  }
}

PartnerCompanyForm.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  clearError: PropTypes.func.isRequired,
  createItem: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  FormikProps: PropTypes.shape({}),
  hideButtons: PropTypes.bool,
  hideErrors: PropTypes.bool,
  initialValues: PropTypes.shape({}),
  language: PropTypes.string,
  onResetEmailSuccess: PropTypes.func,
  onSubmit: PropTypes.func,
  onSubmitFailure: PropTypes.func,
  onSubmitSuccess: PropTypes.func,
  requestError: PropTypes.shape({
    data: PropTypes.oneOfType([
      PropTypes.shape({}),
      PropTypes.string,
    ]),
    message: PropTypes.string,
    status: PropTypes.number,
  }),
  updateItem: PropTypes.func.isRequired,
};

PartnerCompanyForm.defaultProps = {
  disabled: false,
  FormikProps: null,
  hideButtons: false,
  hideErrors: false,
  initialValues: null,
  language: DEFAULT_LANGUAGE,
  onResetEmailSuccess: null,
  onSubmit: null,
  onSubmitFailure: null,
  onSubmitSuccess: null,
  requestError: null,
};

const mapStateToProps = state => ({
  requestError: partnersSelectors.getError(state),
});

const mapDispatchToProps = {
  clearError: partnersActions.clearError,
  createItem: partnersActions.createItem,
  updateItem: partnersActions.updateItem,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(PartnerCompanyForm);
