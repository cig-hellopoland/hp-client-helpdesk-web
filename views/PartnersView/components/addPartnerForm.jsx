import React, { Component, Fragment } from 'react';
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
import Typography from '@material-ui/core/Typography/Typography';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import yupObject from 'yup/lib/object';
import yupString from 'yup/lib/string';
import yupBoolen from 'yup/lib/boolean';
import yupNumber from 'yup/lib/number';
import { actions as sightEventsActions } from '@hello-poland/commons/redux/sightEvents';
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

const styles = () => ({
  title: {
    marginTop: 40,
  },
});

class SightEventForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initialValues: this.getInitialValues(),
      isDefaultTranslation: true,
      ushers: [],
    };

    // TODO: nested validation seems not working
    // TODO: see https://github.com/jaredpalmer/formik/issues/986
    this.validationSchema = yupObject().shape({
      email: yupString()
        .email()
        .trim()
        .required(),
      name: yupString()
        .min(3)
        .max(250)
        .required(),
      commission: yupNumber()
        .min(0)
        .max(100)
        .required(),
      newUser: yupString()
        .email()
        .trim(),
    });
  }

  componentDidUpdate(prevProps) {
    const { initialValues: prevInitialValues } = prevProps;
    const { initialValues } = this.props;

    if (!_isEqual(prevInitialValues, initialValues)) {
      this.setInitialValues(initialValues);
    }
  }

  getInitialValues = () => ({
    email: '',
    name: '',
    commision: 0,
    newUser: '',
  })

  setInitialValues = initialValues => this.setState({
    initialValues: this.getInitialValues(initialValues),
    isDefaultTranslation: this.isDefaultLanguage(initialValues),
  });

  handleSubmit = (values, actions) => {
    const { language, onSubmit } = this.props;
    const options = {
      headers: {
        'Content-Language': language,
      },
    };
    const pathParams = {
      languageVersion: language,
    };

    if (onSubmit) {
      onSubmit(values, actions, options, pathParams);

      return;
    }

    const { id, ...data } = values;
    const {
      createItem, createTranslation, initialValues, updateItem,
    } = this.props;
    let action = createItem;
    const payload = {
      data,
      onFailure: this.handleSubmitFailure(actions),
      onSuccess: this.handleSubmitSuccess(actions),
      options,
      pathParams,
    };


    if (_isNumber(id)) {
      if (!initialValues.language) {
        action = createTranslation;
        payload.data.id = id;
      } else {
        action = updateItem;
        payload.id = id;
        payload.pathParams = pathParams;
      }
    }

    action(payload);
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
    const { initialValues, ushers } = this.state;
    const { FormikProps } = this.props;

    return (
      <Formik
        enableReinitialize
        {...FormikProps}
        initialValues={initialValues}
        validationSchema={this.validationSchema}
        onSubmit={this.handleSubmit}
      >
        {() => (
          <Form autoComplete="off" noValidate>
            <Grid container spacing={16}>
              <GridItem>
                <Typography variant="h6">Dane podstawowe</Typography>
              </GridItem>
              <GridItem>
                <Field name="email" label="E-mail partnera" component={TextField} {...commonProps} />
              </GridItem>
              <GridItem>
                <Field name="commission" label="Opis oferty" required component={TextField} {...commonProps} multiline type="number" />
              </GridItem>
              <GridItem>
                <Field name="newUser" />
              </GridItem>
              <GridItem>
                <Button variant="contained"> elo</Button>
              </GridItem>
            </Grid>
          </Form>
        )}
      </Formik>
    );
  }
}

SightEventForm.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  createItem: PropTypes.func.isRequired,
  createTranslation: PropTypes.func.isRequired,
  FormikProps: PropTypes.shape({}),
  initialValues: PropTypes.shape({}),
  language: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
  onSubmitFailure: PropTypes.func,
  onSubmitSuccess: PropTypes.func,
  updateItem: PropTypes.func.isRequired,
};

SightEventForm.defaultProps = {
  FormikProps: null,
  initialValues: null,
  onSubmit: null,
  onSubmitFailure: null,
  onSubmitSuccess: null,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  createItem: sightEventsActions.createItem,
  createTranslation: sightEventsActions.createTranslation,
  updateItem: sightEventsActions.updateItem,
};

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
)(SightEventForm);
