import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _isEqual from 'lodash/isEqual';
import _isNumber from 'lodash/isNumber';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import yupBoolean from 'yup/lib/boolean';
import yupObject from 'yup/lib/object';
import yupString from 'yup/lib/string';
import {
  actions as sightEventsActions,
  selectors as sightEventsSelectors,
} from '@hello-poland/commons/redux/sightEvents';
import { actions as sightEventCreationActions } from 'redux/sightEventCreation';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import GridItem from 'components/GridItem';
import VoivodeshipSelect, { POLISH_VOIVODESHIPS } from 'components/VoivodeshipSelect';

const commonProps = {
  fullWidth: true,
};

const REQUIRED_FIELD_MESSAGE = 'To pole jest wymagane.';
const MIN_LENGTH_MESSAGE = min => `Wpisz co najmniej ${min} znaków.`;
const MAX_LENGTH_MESSAGE = max => `Wpisz maksymalnie ${max} znaków.`;
const EMAIL_MESSAGE = 'Podaj poprawny adres e-mail.';

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
  errorIcon: {
    fontSize: 48,
  },
  formControl: {
    width: '100%',
  },
  section: {
    marginTop: theme.spacing.unit * 2,
  },
});

class SightEventForm extends React.Component {
  constructor(props) {
    super(props);

    const { initialValues } = this.props;

    this.state = {
      initialValues: this.getInitialValues(initialValues || {}),
    };

    // TODO: nested validation seems not working
    // TODO: see https://github.com/jaredpalmer/formik/issues/986
    this.validationSchema = yupObject().shape({
      name: yupString()
        .min(3, MIN_LENGTH_MESSAGE(3))
        .max(250, MAX_LENGTH_MESSAGE(250))
        .required(REQUIRED_FIELD_MESSAGE),
      published: yupBoolean(),
      // generalAdmission: yupBoolen(),
      lead: yupString()
        .min(10, MIN_LENGTH_MESSAGE(10))
        .max(250, MAX_LENGTH_MESSAGE(250)),
      description: yupString()
        .min(10, MIN_LENGTH_MESSAGE(10))
        .max(2500, MAX_LENGTH_MESSAGE(2500))
        .required(REQUIRED_FIELD_MESSAGE),
      email: yupString().email(EMAIL_MESSAGE).trim(),
      phone: yupString()
        .min(9, MIN_LENGTH_MESSAGE(9))
        .trim()
        .required(REQUIRED_FIELD_MESSAGE),
      location: yupObject().shape({
        directions: yupString()
          .max(1000, MAX_LENGTH_MESSAGE(1000)),
        voivodeship: yupString()
          .oneOf(POLISH_VOIVODESHIPS, 'Wybierz województwo z listy.')
          .required(REQUIRED_FIELD_MESSAGE),
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
      location: initialLocation, pdfAttachment: files,
      mainImage, images, pdfAttachment, ...details
    } = initialValues || {};
    const location = initialLocation || {};

    return {
      id: details.id || '',
      sightId: details.sightId || '',
      name: details.name || '',
      blocked: details.blocked || false,
      published: details.published || false,
      lead: details.lead || '',
      description: details.description || '',
      email: details.email || '',
      phone: details.phone || '',
      location: {
        directions: location.directions || '',
        street: location.street || '',
        zipCode: location.zipCode || '',
        city: location.city || '',
        country: location.country || 'Polska',
        latitude: location.latitude || '',
        longitude: location.longitude || '',
        commune: location.commune || '',
        county: location.county || '',
        voivodeship: location.voivodeship
          ? location.voivodeship.toLocaleLowerCase('pl')
          : '',
      },
      mainImage,
      images,
      pdfAttachment,
      categories: details.categories || [],
      tags: details.tags || [],
    };
  };

  setInitialValues = initialValues => this.setState({
    initialValues: this.getInitialValues(initialValues || {}),
  });

  handleSubmit = (values, actions) => {
    const { initialValues, language, onSubmit } = this.props;

    if (onSubmit) {
      onSubmit(values, actions);

      return;
    }

    const {
      createItem, createTranslation, updateItem,
      uploadedMultimedia,
    } = this.props;
    const { id, ...data } = values;

    const payload = {
      data: {
        ...data,
        mainImage: uploadedMultimedia.mainImage.id
          ? uploadedMultimedia.mainImage : values.mainImage,
        images: uploadedMultimedia.images.length ? uploadedMultimedia.images : values.images,
        pdfAttachment: uploadedMultimedia.pdfAttachment.id
          ? uploadedMultimedia.pdfAttachment : values.pdfAttachment,
      },
      onFailure: this.handleSubmitFailure(actions),
      onSuccess: this.handleSubmitSuccess(actions),
      options: {
        headers: {
          'Content-Language': language,
        },
      },
    };

  if (payload.data && payload.data.location) {
    const loc = payload.data.location;

    if (typeof loc.latitude === 'string' && loc.latitude.trim() !== '') {
      const fixed = loc.latitude.replace(',', '.');
      loc.latitude = parseFloat(fixed);
    } else if (loc.latitude === '' || loc.latitude === undefined) {
      loc.latitude = null;
    }

    if (typeof loc.longitude === 'string' && loc.longitude.trim() !== '') {
      const fixed = loc.longitude.replace(',', '.');
      loc.longitude = parseFloat(fixed);
    } else if (loc.longitude === '' || loc.longitude === undefined) {
      loc.longitude = null;
    }
  }

    let submitAction = createItem;

    if (_isNumber(id)) {
      payload.data.id = id;

      if (initialValues.language === language) {
        submitAction = updateItem;
        payload.id = id;
        payload.pathParams = {
          languageVersion: language,
        };
      } else {
        submitAction = createTranslation;
      }
    }

    submitAction(payload);
  };

  handleSubmitFailure = actions => (error) => {
    const { onSubmitFailure } = this.props;

    if (onSubmitFailure) {
      onSubmitFailure(actions, error);
    }

    const { setSubmitting } = actions;

    setSubmitting(false);
  };

  handleSubmitSuccess = actions => (sightId) => {
    const { onSubmitSuccess, clearError, clearFormChanges } = this.props;
    clearFormChanges();
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
      classes, FormikProps, hideButtons, hideErrors, initialValues: itemValues, language,
      requestError,
    } = this.props;
    const { initialValues } = this.state;
    const { data: errorData } = requestError || {};
    const { message: errorMessage } = errorData || {};
    const { defaultLanguage, id: itemId } = itemValues || {};
    const isDefaultTranslation = !itemId || defaultLanguage === language;

    return (
      <Formik
        enableReinitialize
        {...FormikProps}
        initialValues={initialValues}
        validationSchema={this.validationSchema}
        onSubmit={this.handleSubmit}
      >
        {({ isSubmitting } = {}) => (
          <Form autoComplete="off" noValidate>
            <Grid container spacing={16}>
              <GridItem>
                <Typography variant="h6">Dane podstawowe</Typography>
              </GridItem>
              <Hidden xsUp>
                <GridItem>
                  <Field name="id" hidden component={TextField} {...commonProps} />
                </GridItem>
              </Hidden>
              <Hidden xsUp>
                <GridItem>
                  <Field name="sightId" hidden component={TextField} {...commonProps} />
                </GridItem>
              </Hidden>
              <GridItem>
                <Field name="name" label="Nazwa oferty" required component={TextField} {...commonProps} />
              </GridItem>
              {isDefaultTranslation
                && (
                  <GridItem md={4} sm={4}>
                    <Field
                      name="published"
                      render={switchProps => (
                        <FormControlLabel
                          control={<Switch {...fieldToSwitch(switchProps)} />}
                          label="Publikuj"
                        />
                      )}
                    />
                  </GridItem>
                )
              }
              {isDefaultTranslation
                && (
                  <GridItem md={4} sm={4}>
                    <Field
                      name="blocked"
                      render={switchProps => (
                        <FormControlLabel
                          control={<Switch {...fieldToSwitch(switchProps)} />}
                          label="Blokuj"
                        />
                      )}
                    />
                  </GridItem>
                )
              }
              <GridItem>
                <Field name="lead" label="Warunki oferty" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem>
                <Field name="description" label="Opis oferty" required component={TextField} {...commonProps} multiline rows={4} />
              </GridItem>
              {isDefaultTranslation
                && (
                  <React.Fragment>
                    <GridItem>
                      <Typography variant="h6" className={classes.section}>Dane kontaktowe</Typography>
                    </GridItem>
                    <GridItem md={6} sm={6}>
                      <Field name="email" label="Adres e-mail" type="email" component={TextField} {...commonProps} />
                    </GridItem>
                    <GridItem md={6} sm={6}>
                      <Field name="phone" label="Numer telefonu" required component={TextField} {...commonProps} />
                    </GridItem>
                  </React.Fragment>
                )
              }
              <GridItem>
                <Typography variant="h6" className={classes.section}>Lokalizacja</Typography>
              </GridItem>
              {isDefaultTranslation
                && (
                  <React.Fragment>
                    <GridItem>
                      <Field name="location.street" label="Ulica" component={TextField} {...commonProps} />
                    </GridItem>
                    <GridItem md={4} sm={4}>
                      <Field name="location.zipCode" label="Kod pocztowy" component={TextField} {...commonProps} />
                    </GridItem>
                    <GridItem md={4} sm={4}>
                      <Field name="location.city" label="Miasto" component={TextField} {...commonProps} />
                    </GridItem>
                    <GridItem md={4} sm={4}>
                      <Field name="location.country" label="Kraj" component={TextField} {...commonProps} />
                    </GridItem>
                    <GridItem md={4} sm={4}>
                      <VoivodeshipSelect />
                    </GridItem>
                    <GridItem md={4} sm={4}>
                      <Field name="location.county" label="Powiat" component={TextField} {...commonProps} />
                    </GridItem>
                    <GridItem md={4} sm={4}>
                      <Field name="location.commune" label="Gmina" component={TextField} {...commonProps} />
                    </GridItem>

                      <GridItem md={6} sm={6}>
                        <Field name="location.latitude" label="Szerokość geograficzna (lat)"  component={TextField} type="text" inputProps={{ inputMode: "decimal",  pattern: "[0-9\\.-]*", }} {...commonProps} />
                      </GridItem>
                      <GridItem md={6} sm={6}>
                        <Field name="location.longitude" label="Długość geograficzna (lon)" component={TextField} type="text" inputProps={{ inputMode: "decimal",  pattern: "[0-9\\.-]*", }} {...commonProps} />
                      </GridItem>
                  </React.Fragment>
                )
              }
              <GridItem>
                <Field name="location.directions" label="Wskazówki dojazdu" component={TextField} {...commonProps} multiline rows={3} />
              </GridItem>
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
    );
  }
}

SightEventForm.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  clearError: PropTypes.func.isRequired,
  clearFormChanges: PropTypes.func.isRequired,
  createItem: PropTypes.func.isRequired,
  createTranslation: PropTypes.func.isRequired,
  FormikProps: PropTypes.shape({}),
  hideButtons: PropTypes.bool,
  hideErrors: PropTypes.bool,
  initialValues: PropTypes.shape({}),
  language: PropTypes.string,
  onSubmit: PropTypes.func,
  onSubmitFailure: PropTypes.func,
  onSubmitSuccess: PropTypes.func,
  requestError: PropTypes.shape({
    message: PropTypes.string,
  }),
  updateItem: PropTypes.func.isRequired,
  uploadedMultimedia: PropTypes.shape({}),
};

SightEventForm.defaultProps = {
  FormikProps: null,
  hideButtons: false,
  hideErrors: false,
  initialValues: null,
  language: DEFAULT_LANGUAGE,
  onSubmit: null,
  onSubmitFailure: null,
  onSubmitSuccess: null,
  requestError: null,
  uploadedMultimedia: null,
};

const mapStateToProps = state => ({
  requestError: sightEventsSelectors.getError(state),
});

const mapDispatchToProps = {
  clearError: sightEventsActions.clearError,
  createItem: sightEventCreationActions.createSightEvent,
  createTranslation: sightEventsActions.createTranslation,
  updateItem: sightEventsActions.updateItem,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(SightEventForm);
