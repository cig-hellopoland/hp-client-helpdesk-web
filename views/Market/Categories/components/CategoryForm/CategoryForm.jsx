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
  actions as categoriesActions,
  selectors as categoriesSelectors,
} from '@hello-poland/commons/redux/categories';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import GridItem from 'components/GridItem';
import IconGalleryDialog from 'components/IconGallery/IconGalleryDialog';
import ArrayBufferMediaManager from 'components/MediaManager/ArrayBufferMediaManager';
import config from 'config';

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

class CategoryForm extends React.Component {
  constructor(props) {
    super(props);

    const { initialValues } = this.props;

    this.state = {
      iconSelectDialog: false,
      iconUploadDialog: false,
      iconUploadError: '',
      initialValues: this.getInitialValues(initialValues || {}),
    };

    this.validationSchema = yupObject().shape({
      backgroundUrl: yupString().trim(),
      iconUrl: yupString().trim(),
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
    backgroundUrl: initialValues.backgroundUrl || '',
    iconUrl: initialValues.iconUrl || '',
    label: initialValues.label || '',
    recommended: initialValues.recommended || false,
    restricted: initialValues.restricted || false,
  });

  setInitialValues = initialValues => this.setState({
    initialValues: this.getInitialValues(initialValues || {}),
  });

  handleIconSelectDialogClose = () => this.setState({ iconSelectDialog: false });

  handleIconSelectDialogOpen = () => this.setState({ iconSelectDialog: true });

  handleIconUploadDialogClose = () => {
    const { clearError } = this.props;

    this.setState({ iconUploadDialog: false, iconUploadError: '' });

    if (clearError) {
      clearError();
    }
  }

  handleIconUploadDialogOpen = () => this.setState({ iconUploadDialog: true });

  handleIconSelect = actions => (iconURL) => {
    const { setFieldValue } = actions;

    if (iconURL) {
      setFieldValue('iconUrl', iconURL);
    }
  };

  handleIconUpload = ({ data, options }) => {
    const { initialValues, uploadIcon } = this.props;
    const { id } = initialValues || {};

    if (uploadIcon && id) {
      uploadIcon({
        id,
        data,
        options,
        onFailure: this.handleIconUploadFailure,
        onSuccess: this.handleIconUploadSuccess,
      });
    }
  };


  handleIconUploadFailure = () => {
    const { requestError } = this.props;
    const { data: errorData } = requestError || {};
    const { message: errorMessage } = errorData || {};

    this.setState({ iconUploadError: errorMessage });
  };

  handleIconUploadSuccess = () => {
    const { onUploadSuccess } = this.props;

    this.handleIconUploadDialogClose();

    this.setState({ iconUploadError: '' });

    if (onUploadSuccess) {
      onUploadSuccess();
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
      data: {
        ...initialValues,
        ...data,
      },
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

  handleSubmitSuccess = actions => (categoryId) => {
    const { onSubmitSuccess, clearError } = this.props;

    if (onSubmitSuccess) {
      onSubmitSuccess(categoryId, actions);

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
    const {
      iconSelectDialog, iconUploadDialog, iconUploadError, initialValues,
    } = this.state;
    const { data: errorData } = requestError || {};
    const { message: errorMessage } = errorData || {};
    const { defaultLanguage, id: itemId } = itemValues || {};
    const isIconSelectDisabled = itemId && defaultLanguage !== language;
    const isIconUploadDisabled = itemId === undefined || defaultLanguage !== language;
    const { brandName } = (config && config.public) || {};

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
                <Field name="label" label="Nazwa kategorii" required component={TextField} {...commonProps} />
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
                    <Button
                      onClick={this.handleIconSelectDialogOpen}
                      disabled={isIconSelectDisabled}
                    >
                      Wybierz ikonę
                    </Button>
                    <Typography>lub</Typography>
                    <Button
                      onClick={this.handleIconUploadDialogOpen}
                      disabled={isIconUploadDisabled}
                    >
                      Prześlij ikonę
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
              <GridItem>
                <Field name="backgroundUrl" label="URL pliku z tłem" component={TextField} {...commonProps} />
              </GridItem>
              <GridItem container md={4} sm={4}>
                <Field
                  disabled={isIconSelectDisabled}
                  name="restricted"
                  Label={{ label: `Zastrzeżona dla ${brandName || 'administratora'}` }}
                  component={CheckboxWithLabel}
                />
              </GridItem>
              <GridItem container md={4} sm={4}>
                <Field
                  disabled={isIconSelectDisabled}
                  name="recommended"
                  Label={{ label: 'Polecana' }}
                  component={CheckboxWithLabel}
                />
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
            <IconGalleryDialog
              open={iconSelectDialog}
              onClose={this.handleIconSelectDialogClose}
              onSelect={this.handleIconSelect(formikBag)}
            />
            <ArrayBufferMediaManager
              disableBackdropClick
              error={!!iconUploadError}
              errorMessage={iconUploadError}
              onClose={this.handleIconUploadDialogClose}
              onSubmit={this.handleIconUpload}
              open={iconUploadDialog}
              title="Prześlij ikonę"
            />
          </Form>
        )}
      </Formik>
    );
  }
}

CategoryForm.propTypes = {
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
  onUploadSuccess: PropTypes.func,
  requestError: PropTypes.shape({
    message: PropTypes.string,
  }),
  updateItem: PropTypes.func.isRequired,
  uploadIcon: PropTypes.func.isRequired,
};

CategoryForm.defaultProps = {
  FormikProps: null,
  hideButtons: false,
  hideErrors: false,
  initialValues: null,
  language: DEFAULT_LANGUAGE,
  onSubmit: null,
  onSubmitFailure: null,
  onSubmitSuccess: null,
  onUploadSuccess: null,
  requestError: null,
};

const mapStateToProps = state => ({
  requestError: categoriesSelectors.getError(state),
});

const mapDispatchToProps = {
  clearError: categoriesActions.clearError,
  createItem: categoriesActions.createItem,
  createTranslation: categoriesActions.createTranslation,
  updateItem: categoriesActions.updateItem,
  uploadIcon: categoriesActions.uploadIcon,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(CategoryForm);
