import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _isEqual from 'lodash/isEqual';
import _isNumber from 'lodash/isNumber';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { Formik, Form, Field } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-material-ui';
import yupBoolean from 'yup/lib/boolean';
import yupObject from 'yup/lib/object';
import yupString from 'yup/lib/string';
import {
  actions as tagsActions,
  selectors as tagsSelectors,
} from '@hello-poland/commons/redux/tags';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import GridItem from 'components/GridItem';
import IconGalleryDialog from 'components/IconGallery/IconGalleryDialog';

const commonProps = {
  fullWidth: true,
};

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

class TagForm extends React.Component {
  constructor(props) {
    super(props);

    const { initialValues } = this.props;

    this.state = {
      iconDialog: false,
      initialValues: this.getInitialValues(initialValues || {}),
    };

    this.validationSchema = yupObject().shape({
      iconUrl: yupString().trim().required(),
      label: yupString().trim().required(),
      recommended: yupBoolean(),
      restricted: yupBoolean(),
    });
  }

  componentDidUpdate(prevProps) {
    const { initialValues: prevInitialValues } = prevProps;
    const { initialValues } = this.props;

    if (!_isEqual(prevInitialValues, initialValues)) {
      this.setInitialValues(initialValues);
    }
  }

  getInitialValues = initialValues => ({
    id: initialValues.id || undefined,
    iconUrl: initialValues.iconUrl || '',
    label: initialValues.label || '',
    recommended: initialValues.recommended || false,
    restricted: initialValues.restricted || false,
  });

  setInitialValues = initialValues => this.setState({
    initialValues: this.getInitialValues(initialValues || {}),
  });

  handleIconDialogClose = () => this.setState({ iconDialog: false });

  handleIconDialogOpen = () => this.setState({ iconDialog: true });

  handleIconSelect = actions => (iconURL) => {
    const { setFieldValue } = actions;

    if (iconURL) {
      setFieldValue('iconUrl', iconURL);
    }
  };

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
    const { iconDialog, initialValues } = this.state;
    const { data: errorData } = requestError || {};
    const { message: errorMessage } = errorData || {};
    const { defaultLanguage, id: itemId } = itemValues || {};
    const isDisabled = itemId && defaultLanguage !== language;

    return (
      <Formik
        enableReinitialize
        {...FormikProps}
        initialValues={initialValues}
        validationSchema={this.validationSchema}
        onSubmit={this.handleSubmit}
      >
        {({
          errors, isSubmitting, values, ...formikBag
        } = {}) => (
          <Form autoComplete="off" noValidate>
            <Grid container spacing={16}>
              <Hidden xsUp>
                <GridItem>
                  <Field name="id" hidden component={TextField} {...commonProps} />
                </GridItem>
              </Hidden>
              <GridItem>
                <Field name="label" label="Nazwa tagu" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem>
                <Hidden xsUp>
                  <Field name="iconUrl" required component={TextField} {...commonProps} />
                </Hidden>
                <Grid container alignItems="center">
                  <GridItem container alignItems="center">
                    {values.iconUrl
                      ? <img src={values.iconUrl} height={48} width={48} alt="" />
                      : <ErrorOutlineIcon color="error" className={classes.errorIcon} />
                    }
                    <Button onClick={this.handleIconDialogOpen} disabled={isDisabled}>
                      Wybierz ikonę
                    </Button>
                  </GridItem>
                  {errors.iconUrl
                    && (
                      <GridItem>
                        <FormHelperText error>{errors.iconUrl}</FormHelperText>
                      </GridItem>
                    )
                  }
                </Grid>
              </GridItem>
              <GridItem container md={4} sm={4} alignItems="flex-end">
                <Field
                  disabled={isDisabled}
                  name="restricted"
                  Label={{ label: 'Zastrzeżony dla Hello! Poland' }}
                  component={CheckboxWithLabel}
                />
              </GridItem>
              <GridItem container md={4} sm={4} alignItems="flex-end">
                <Field
                  disabled={isDisabled}
                  name="recommended"
                  Label={{ label: 'Polecany' }}
                  component={CheckboxWithLabel}
                />
              </GridItem>
              <GridItem md={4} sm={4} />
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
            <IconGalleryDialog
              open={iconDialog}
              onClose={this.handleIconDialogClose}
              onSelect={this.handleIconSelect(formikBag)}
            />
          </Form>
        )}
      </Formik>
    );
  }
}

TagForm.propTypes = {
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

TagForm.defaultProps = {
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
  requestError: tagsSelectors.getError(state),
});

const mapDispatchToProps = {
  clearError: tagsActions.clearError,
  createItem: tagsActions.createItem,
  createTranslation: tagsActions.createTranslation,
  updateItem: tagsActions.updateItem,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(TagForm);
