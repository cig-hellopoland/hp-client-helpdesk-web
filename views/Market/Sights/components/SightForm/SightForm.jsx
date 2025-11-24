import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _find from 'lodash/find';
import _isEqual from 'lodash/isEqual';
import _isNumber from 'lodash/isNumber';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import TimePicker from 'material-ui-pickers/TimePicker';
import MuiPickersUtilsProvider from 'material-ui-pickers/MuiPickersUtilsProvider';
import DateFnsUtils from '@date-io/date-fns';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import yupBoolean from 'yup/lib/boolean';
import yupObject from 'yup/lib/object';
import yupString from 'yup/lib/string';
import {
  actions as sightsActions,
  selectors as sightsSelectors,
} from '@hello-poland/commons/redux/sights';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import GridItem from 'components/GridItem';

const i18n = {
  days: {
    1: 'Poniedziałek',
    2: 'Wtorek',
    3: 'Środa',
    4: 'Czwartek',
    5: 'Piątek',
    6: 'Sobota',
    7: 'Niedziela',
  },
};

const commonProps = {
  fullWidth: true,
};

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
  openingHoursTimepicker: {
    width: 50,
  },
});

class SightForm extends React.Component {
  constructor(props) {
    super(props);

    const { initialValues } = this.props;
    const { openingHours } = initialValues || {};

    this.state = {
      initialValues: this.getInitialValues(initialValues || {}),
      viewOpeningHours: this.getInitialOpeningHours(openingHours, true),
    };

    // TODO: nested validation seems not working
    // TODO: see https://github.com/jaredpalmer/formik/issues/986
    this.validationSchema = yupObject().shape({
      name: yupString().min(3).max(250).required(),
      published: yupBoolean(),
      // generalAdmission: yupBoolen(),
      lead: yupString().min(10).max(250),
      description: yupString().min(10).max(2500).required(),
      email: yupString().email().trim(),
      phone: yupString().min(9).trim(),
      // location: yupObject().shape({
      //   directions: yupString().min(5).max(255),
      //   street: yupString().min(5),
      //   zipCode: yupString().min(6).max(6),
      //   city: yupString().min(3),
      //   country: yupString().min(5),
      // }),
    });
  }

  componentDidUpdate(prevProps) {
    const { initialValues: prevInitialValues } = prevProps;
    const { initialValues } = this.props;

    if (!_isEqual(prevInitialValues, initialValues)) {
      const { openingHours } = initialValues || {};

      this.setInitialValues(initialValues);
      this.setViewOpeningHours(openingHours, true);
    }
  }

  getFormattedTime = (datetime, dateFormat = 'HH:mm') => {
    const parsedDatetime = typeof datetime === 'string' ? parseISO(datetime) : datetime;

    return format(parsedDatetime, dateFormat);
  };

  getInitialOpeningHours = (initialValues = [], viewValues = false) => {
    let openingHours = [];

    if (viewValues) {
      for (let i = 1; i < 8; i += 1) {
        const values = _find(initialValues, { day: i }) || {};
        const { closeTime, openTime } = values;
        const checked = !!Object.getOwnPropertyNames(values).length;

        openingHours.push({
          checked,
          day: i,
          openTime: openTime ? `1970-01-01T${openTime}` : '1970-01-01T09:00',
          closeTime: closeTime ? `1970-01-01T${closeTime}` : '1970-01-01T18:00',
        });
      }
    } else {
      openingHours = initialValues;
    }

    return openingHours;
  };

  getInitialValues = (initialValues) => {
    const {
      location: initialLocation, openingHours, mainImage,
      images, ...details
    } = initialValues || {};
    const location = initialLocation || {};

    return {
      id: details.id || '',
      name: details.name || '',
      blocked: details.blocked || false,
      published: details.published || false,
      lead: details.lead || '',
      description: details.description || '',
      email: details.email || '',
      phone: details.phone || '',
      openingHours: this.getInitialOpeningHours(openingHours),
      location: {
        street: location.street || '',
        zipCode: location.zipCode || '',
        city: location.city || '',
        country: location.country || 'Polska',
        latitude: location.latitude || '',
        longitude: location.longitude || '',
      },
      mainImage,
      images,
    };
  };

  setInitialValues = initialValues => this.setState({
    initialValues: this.getInitialValues(initialValues || {}),
  });

  setViewOpeningHours = openingHours => this.setState({
    viewOpeningHours: this.getInitialOpeningHours(openingHours, true),
  });

  handleOpeningHoursChange = (day, keyName, keyValue) => {
    const { initialValues, viewOpeningHours } = this.state;
    const { openingHours } = initialValues;
    const dayIndex = day - 1;
    const entryIndex = openingHours.findIndex(o => o.day === day);

    viewOpeningHours[dayIndex][keyName] = keyValue;
    openingHours[entryIndex][keyName] = this.getFormattedTime(keyValue);

    this.setState({
      initialValues: {
        ...initialValues,
        openingHours,
      },
      viewOpeningHours,
    });
  };

  handleOpeningHoursSelectionChange = (day, values) => (event) => {
    const { viewOpeningHours } = this.state;
    const { target } = event;
    const dayIndex = day - 1;
    let { openingHours } = values;

    viewOpeningHours[dayIndex].checked = target.checked;

    if (target.checked) {
      const { closeTime, openTime } = viewOpeningHours[dayIndex];

      openingHours.push({
        day: viewOpeningHours[dayIndex].day,
        openTime: this.getFormattedTime(openTime),
        closeTime: this.getFormattedTime(closeTime),
      });

      openingHours.sort((a, b) => a.day - b.day);
    } else {
      openingHours = openingHours.filter(o => o.day !== day);
    }

    this.setState({
      initialValues: {
        ...values,
        openingHours,
      },
      viewOpeningHours,
    });
  };

  handleSubmit = (values, actions) => {
    const { initialValues, language, onSubmit } = this.props;

    if (onSubmit) {
      onSubmit(values, actions);

      return;
    }

    const {
      createItem, createTranslation,
      updateItem, uploadedMultimedia,
    } = this.props;
    const { id, ...data } = values;

    const payload = {
      data: {
        ...data,
        mainImage: uploadedMultimedia.mainImage.id
          ? uploadedMultimedia.mainImage : values.mainImage,
        images: uploadedMultimedia.images.length ? uploadedMultimedia.images : values.images,
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

  handleSubmitFailure = actions => () => {
    const { onSubmitFailure } = this.props;

    if (onSubmitFailure) {
      onSubmitFailure(actions);
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
    const { initialValues, viewOpeningHours } = this.state;
    const { data: errorData } = requestError || {};
    const { message: errorMessage } = errorData || {};
    const { defaultLanguage, id: itemId } = itemValues || {};
    const isDefaultTranslation = itemId && defaultLanguage === language;

    return (
      <Formik
        enableReinitialize
        {...FormikProps}
        initialValues={initialValues}
        validationSchema={this.validationSchema}
        onSubmit={this.handleSubmit}
      >
        {({ isSubmitting, values } = {}) => (
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
                <Field name="lead" label="Wprowadzenie" component={TextField} {...commonProps} />
              </GridItem>
              <GridItem>
                <Field name="description" label="Opis oferty" required component={TextField} {...commonProps} multiline rowsMax={20} />
              </GridItem>
              {isDefaultTranslation
                && (
                  <React.Fragment>
                    <GridItem>
                      <Typography variant="h6" className={classes.title}>Godziny otwarcia</Typography>
                    </GridItem>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      {viewOpeningHours.map(item => (
                        <React.Fragment key={`openingHours-list-${item.day}`}>
                          <GridItem sm={6} md={6}>
                            <FormControlLabel
                              control={(
                                <Switch
                                  checked={item.checked}
                                  onChange={
                                    this.handleOpeningHoursSelectionChange(item.day, values)
                                  }
                                  value={`${item.day}`}
                                />
                              )}
                              label={i18n.days[item.day]}
                            />
                          </GridItem>
                          <GridItem sm={3} md={3}>
                            <TimePicker
                              ampm={false}
                              className={classes.openingHoursTimepicker}
                              disabled={!item.checked}
                              onChange={event => this.handleOpeningHoursChange(item.day, 'openTime', event)}
                              value={item.openTime}
                            />
                          </GridItem>
                          <GridItem sm={3} md={3}>
                            <TimePicker
                              ampm={false}
                              className={classes.openingHoursTimepicker}
                              disabled={!item.checked}
                              onChange={event => this.handleOpeningHoursChange(item.day, 'closeTime', event)}
                              value={item.closeTime}
                            />
                          </GridItem>
                        </React.Fragment>
                      ))}
                    </MuiPickersUtilsProvider>
                  </React.Fragment>
                )
              }
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
                      <Field name="phone" label="Numer telefonu" component={TextField} {...commonProps} />
                    </GridItem>
                  </React.Fragment>
                )
              }
              {isDefaultTranslation
                && (
                  <React.Fragment>
                    <GridItem>
                      <Typography variant="h6" className={classes.section}>Lokalizacja</Typography>
                    </GridItem>
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
                    <GridItem md={6} sm={6}>
                      <Field name="location.latitude" label="Szerokość geograficzna (lat)" component={TextField} type="text" inputProps={{ inputMode: "decimal",  pattern: "[0-9\\.-]*", }} {...commonProps} />
                    </GridItem>
                    <GridItem md={6} sm={6}>
                      <Field  name="location.longitude"  label="Długość geograficzna (lon)" component={TextField}  inputProps={{ inputMode: "decimal",  pattern: "[0-9\\.-]*", }}  {...commonProps} />
                    </GridItem>
                  </React.Fragment>
                )
              }
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

SightForm.propTypes = {
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

SightForm.defaultProps = {
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
  requestError: sightsSelectors.getError(state),
});

const mapDispatchToProps = {
  clearError: sightsActions.clearError,
  createItem: sightsActions.createItem,
  createTranslation: sightsActions.createTranslation,
  updateItem: sightsActions.updateItem,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(SightForm);
