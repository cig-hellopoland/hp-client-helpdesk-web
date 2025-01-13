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
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ContactMailIcon from '@material-ui/icons/ContactMail';
import MuiTextField from '@material-ui/core/TextField';
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
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
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

const styles = {
  formControl: {
    width: '100%',
  },
  section: {
    marginTop: 40,
  },
};

class PartnerCompanyForm extends Component {
  constructor(props) {
    super(props);

    const { initialValues } = this.props;

    this.state = {
      initialValues: this.getInitialValues(initialValues || {}),
      email: '',
      emailDialogOpen: false,
    };

    this.validationSchema = yupObject().shape({
      affiliation: yupBoolean(), // disabled per client's request
      // bankAccount: yupString().trim(), // disabled per client's request
      businessType: yupNumber().required(),
      // commission: yupNumber().min(0).max(100), // disabled per client's request
      contactPerson: yupObject().shape({
        email: yupString().email().trim().required(),
        name: yupString().required(),
        phone: yupString().trim().required(),
      }),
      email: yupString().email().trim().required(),
      // invoiceEmail: yupString().email().trim(), // disabled per client's request
      krs: yupString().when('businessType', {
        is: businessType => businessType > 3,
        then: yupString().required(),
      }),
      location: yupObject().shape({
        city: yupString().required(),
        country: yupString().required(),
        street: yupString().required(),
        zipCode: yupString().required(),
      }),
      name: yupString().required(),
      phone: yupString().trim().required(),
      regon: yupString().when('businessType', {
        is: businessType => businessType > 1,
        then: yupString().required(),
      }),
      // servicesDescription: yupString(), // disabled per client's request
      socialNumber: yupString().when('businessType', {
        is: businessType => businessType === 1,
        then: yupString().required(),
      }),
      taxNumber: yupString().when('businessType', {
        is: businessType => businessType > 1,
        then: yupString().required(),
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
      affiliation: details.affiliation || true, // disabled per client's request
      // bankAccount: details.bankAccount || '', // disabled per client's request
      blocked: details.blocked || false,
      businessType: details.businessType || '',
      // commission: details.commission || '0', // disabled per client's request
      contactPerson: {
        email: contactPerson.email || '',
        name: contactPerson.name || '',
        phone: contactPerson.phone || '',
      },
      email: details.email || '',
      // invoiceEmail: details.invoiceEmail || '', // disabled per client's request
      krs: details.krs || '',
      location: {
        city: location.city || '',
        country: location.country || 'PL',
        street: location.street || '',
        zipCode: location.zipCode || '',
      },
      name: details.name || '',
      phone: details.phone || '',
      regon: details.regon || '',
      // servicesDescription: details.servicesDescription || '', // disabled per client's request
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

    if (values.businessType > 3) {
      parsedValues.krs = krs;
    }

    return parsedValues;
  };

  handleBusinessTypeChange = actions => (event) => {
    const { setFieldValue } = actions;
    const { name, value } = event.target;

    setFieldValue(name, value);

    if (value === 1) {
      setFieldValue('taxNumber', '');
      setFieldValue('regon', '');
      setFieldValue('krs', '');
    } else {
      setFieldValue('socialNumber', '');
    }

    if (value > 1 && value < 4) {
      setFieldValue('krs', '');
    }
  };

  handleChange = fieldName => event => this.setState({ [fieldName]: event.target.value });

  handleEmailChange = (event) => {
    const { value } = event.target;
    this.setState({ email: value && value.trim() });
  }

  handleEmailDialogAccept = () => {
    const { onResetEmailSuccess } = this.props;
    const { email, initialValues } = this.state;
    const { id } = initialValues;

    if (onResetEmailSuccess) {
      onResetEmailSuccess({ email, partnerId: id });
    }

    this.handleEmailDialogToggle();
  }

  handleEmailDialogToggle = () => this.setState(({ email, emailDialogOpen, ...state }) => ({
    ...state,
    email: !emailDialogOpen ? email : '',
    emailDialogOpen: !emailDialogOpen,
  }));

  handleSubmit = (values, actions) => {
    const { initialValues, language, onSubmit } = this.props;
    const parsedValues = this.getParsedValues(values);

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
      payload.data = _merge({}, initialValues, data);
      payload.pathParams = {
        languageVersion: language,
      };
    }

    submitAction(payload);
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
      classes, disabled, isEditMode, requestError, FormikProps, hideButtons, hideErrors,
    } = this.props;
    const { emailDialogOpen, initialValues } = this.state;
    const { data: errorData } = requestError || {};
    const { message: errorMessage } = errorData || {};
    const { brandName } = (config && config.public) || {};

    return (
      <React.Fragment>
        <Formik
          enableReinitialize
          {...FormikProps}
          disabled={disabled}
          initialValues={initialValues}
          validationSchema={this.validationSchema}
          onSubmit={this.handleSubmit}
        >
          {({ isSubmitting, values, setFieldValue } = {}) => (
            <Form autoComplete="off" noValidate>
              <Grid container spacing={16}>
                <GridItem>
                  <Typography variant="h6">Dane partnera</Typography>
                  {values.id
                    && (
                      <Typography color="error">
                        {`UWAGA: Modyfikujesz dane w systemie ${brandName}. Upewnij się, że partner zaktualizuje je w Przelewach24.`}
                      </Typography>
                    )
                  }
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
                    <InputLabel disabled={disabled} htmlFor="location-country">Kraj</InputLabel>
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
                  <Field disabled={disabled} name="phone" type="tel" label="Telefon" required component={TextField} {...commonProps} />
                </GridItem>
                <GridItem md={4} sm={4}>
                  <Field disabled={disabled || isEditMode} name="email" type="email" label="E-mail (login partnera)" required component={TextField} {...commonProps} />
                </GridItem>
                {isEditMode && (
                  <GridItem md={4} sm={4}>
                    <Tooltip title="Zmień e-mail">
                      <IconButton color="primary" aria-label="Zmień e-mail" onClick={this.handleEmailDialogToggle}>
                        <ContactMailIcon />
                      </IconButton>
                    </Tooltip>
                  </GridItem>
                )}
                <GridItem className={classes.section}>
                  <Typography variant="h6">Informacje o działalności</Typography>
                </GridItem>
                <GridItem md={3} sm={3}>
                  <FormControl className={classes.formControl} required>
                    <InputLabel htmlFor="business-type">Rodzaj działalności</InputLabel>
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
                {values.businessType && values.businessType !== 1
                  && (
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
                {values.businessType && values.businessType > 3
                  && (
                    <GridItem md={3} sm={3}>
                      <Field disabled={disabled} name="krs" label="KRS" required component={TextField} {...commonProps} />
                    </GridItem>
                  )
                }
                {values.businessType && values.businessType === 1
                  && (
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
                  <Typography variant="h6">Ustawienia dodatkowe</Typography>
                </GridItem>
                {/* <GridItem className={classes.section}> */}
                {/*  <Typography variant="h6">Płatności</Typography> */}
                {/* </GridItem> */}
                {/* <GridItem md={4} sm={4}> */}
                {/*  <Field */}
                {/*    disabled={disabled} */}
                {/*    name="bankAccount" */}
                {/*    label="Konto bankowe" */}
                {/*    helperText="Format: tylko cyfry, bez spacji" */}
                {/*    component={TextField} */}
                {/*    {...commonProps} */}
                {/*  /> */}
                {/* </GridItem> */}
                {/* <GridItem md={4} sm={4}> */}
                {/*  <Field */}
                {/*    disabled={disabled} */}
                {/*    name="invoiceEmail" */}
                {/*    type="email" */}
                {/*    label="E-mail do faktur" */}
                {/*    component={TextField} */}
                {/*    {...commonProps} */}
                {/*  /> */}
                {/* </GridItem> */}
                {/* <GridItem md={4} sm={4} /> */}
                {/* <GridItem md={4} sm={4}> */}
                {/*  <Field */}
                {/*    disabled={disabled} */}
                {/*    name="commission" */}
                {/*    type="number" */}
                {/*    label="Prowizja (%)" */}
                {/*    required */}
                {/*    component={TextField} */}
                {/*    {...commonProps} */}
                {/*  /> */}
                {/* </GridItem> */}
                <GridItem container md={4} sm={4} alignItems="flex-end">
                  <Field
                    disabled={disabled}
                    name="affiliation"
                    Label={{ label: 'Generuj kod afiliacyjny' }}
                    component={CheckboxWithLabel}
                  />
                </GridItem>
                {/* <GridItem md={4} sm={4} /> */}
                {/* <GridItem className={classes.section}> */}
                {/*  <Typography variant="h6">Przelewy24</Typography> */}
                {/* </GridItem> */}
                {/* <GridItem> */}
                {/*  <Field */}
                {/*    disabled={disabled} */}
                {/*    name="servicesDescription" */}
                {/*    label="Opis usługi partnera" */}
                {/*    component={TextField} */}
                {/*    {...commonProps} */}
                {/*  /> */}
                {/* </GridItem> */}
              </Grid>
              {(!hideButtons || (!hideErrors && errorMessage))
                && (
                  <Grid container spacing={16} justify="flex-end" className={classes.section}>
                    {!hideErrors && errorMessage
                      && (
                        <GridItem container md={9} sm={9}>
                          <Typography color="error">{errorMessage}</Typography>
                        </GridItem>
                      )
                    }
                    {!hideButtons
                      && (
                        <GridItem container md={3} sm={3} justify="flex-end">
                          <Button variant="contained" color="primary" type="submit" disabled={isSubmitting}>
                            Zapisz
                          </Button>
                        </GridItem>
                      )
                    }
                  </Grid>
                )
              }
            </Form>
          )}
        </Formik>
        <Dialog
          open={emailDialogOpen}
          onClose={this.handleEmailDialogToggle}
          // onExited={this.handleDialogExited}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Zmiana adresu e-mail partnera
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Wprowadź nowy adres e-mail głównego użytkownika partnera. Zaktualizujemy mu
              hasło i wyślemy wiadomość z danymi do logowania.
            </DialogContentText>
            <MuiTextField
              fullWidth
              label="Nowy e-mail"
              onChange={this.handleEmailChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleEmailDialogToggle} color="primary">
              Anuluj
            </Button>
            <Button onClick={this.handleEmailDialogAccept} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
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
  isEditMode: PropTypes.bool,
  language: PropTypes.string,
  onSubmit: PropTypes.func,
  onSubmitFailure: PropTypes.func,
  onSubmitSuccess: PropTypes.func,
  onResetEmailSuccess: PropTypes.func,
  requestError: PropTypes.shape({
    message: PropTypes.string,
  }),
  updateItem: PropTypes.func.isRequired,
};

PartnerCompanyForm.defaultProps = {
  disabled: false,
  FormikProps: null,
  hideButtons: false,
  hideErrors: false,
  initialValues: null,
  isEditMode: false,
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
