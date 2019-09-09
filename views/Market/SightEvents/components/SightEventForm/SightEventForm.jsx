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
import { DEFAULT_LANGUAGE } from 'utils/translations';
import GridItem from 'components/GridItem';

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

const styles = {
  errorIcon: {
    fontSize: 48,
  },
  formControl: {
    width: '100%',
  },
  section: {
    marginTop: 40,
  },
};

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
      this.setInitialValues(initialValues);
    }
  }

  getInitialValues = (initialValues) => {
    const { location: initialLocation, pdfAttachment: files, ...details } = initialValues || {};
    const location = initialLocation || {};

    return {
      id: details.id || '',
      sightId: details.sightId || '',
      name: details.name || '',
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
        country: location.country || '',
      },
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

    const { createItem, createTranslation, updateItem } = this.props;
    const { id, ...data } = values;

    const payload = {
      data,
      onFailure: this.handleSubmitFailure(actions),
      onSuccess: this.handleSubmitSuccess(actions),
      options: {
        headers: {
          'Content-Language': language,
        },
      },
    };

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
      classes, FormikProps, hideButtons, hideErrors, initialValues: itemValues, language,
      requestError,
    } = this.props;
    const { initialValues } = this.state;
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
                <Field name="lead" label="Wprowadzenie" component={TextField} {...commonProps} />
              </GridItem>
              <GridItem>
                <Field name="description" label="Opis oferty" required component={TextField} {...commonProps} multiline rowsMax={20} />
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
                      <Field name="phone" label="Numer telefonu" component={TextField} {...commonProps} />
                    </GridItem>
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
                    <GridItem>
                      <Field name="location.directions" label="Wskazówki dojazdu" component={TextField} {...commonProps} multiline rowsMax={10} />
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

SightEventForm.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  clearError: PropTypes.func.isRequired,
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
};

const mapStateToProps = state => ({
  requestError: sightEventsSelectors.getError(state),
});

const mapDispatchToProps = {
  clearError: sightEventsActions.clearError,
  createItem: sightEventsActions.createItem,
  createTranslation: sightEventsActions.createTranslation,
  updateItem: sightEventsActions.updateItem,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(SightEventForm);
