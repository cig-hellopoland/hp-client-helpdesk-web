import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography/Typography';
import { Formik, Form, Field, FieldArray } from 'formik';
import { TextField } from 'formik-material-ui';
import yupObject from 'yup/lib/object';
import yupString from 'yup/lib/string';
import { actions as partnersActions } from 'redux/partners';
import GridItem from 'components/GridItem';


const commonProps = {
  fullWidth: true,
};

const styles = () => ({
  title: {
    marginTop: 40,
  },
});

class AddTicketerForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initialValues: {
        email: '',
      }
    };

    // TODO: nested validation seems not working
    // TODO: see https://github.com/jaredpalmer/formik/issues/986
    this.validationSchema = yupObject().shape({
      email: yupString().email().trim(),
    });
  }

  handleSubmit = (values, actions) => {
    const { createPartner } = this.props;
    const { ushers } = this.state;
    const data = { ...values, users: ushers };
    createPartner({
      data,
    });
    console.log(values, actions)
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

  validateEmail = (value) => {
    const { ushers } = this.state;
    // eslint-disable-next-line no-useless-escape
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !re.test(value);
  }

  handleAddUsher = (email) => {
    const { ushers } = this.state;
    console.log(ushers);
    ushers.push({email, role: 'USHER'});
    this.setState({ushers})
  }

  isUserEmailUsed = (email) => {
    const { ushers } = this.state;
    return ushers.some(({email}))
  }

  render() {
    const { initialValues, usherEmail, ushers } = this.state;
    const { FormikProps } = this.props;
    console.log(ushers)
    return (
      <Formik
        enableReinitialize
        {...FormikProps}
        initialValues={initialValues}
        validationSchema={this.validationSchema}
        onSubmit={this.handleSubmit}
      >
        {() => (
          <Fragment>
            <Typography variant="h6">Bileterzy</Typography>

            <List>

            </List>
          <Form autoComplete="off" noValidate>
            <Grid container spacing={24}>
              <GridItem>
                <Typography variant="subtitle1">Dodaj biletera</Typography>
              </GridItem>
              <GridItem>
                <Field name="email" label="E-mail Biletera" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem>
                <Button variant="contained" color="secondary">Dodaj</Button>
              </GridItem>
            </Grid>
          </Form>
          </Fragment>
        )}
      </Formik>
    );
  }
}

AddTicketerForm.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  createPartner: PropTypes.func.isRequired,
  FormikProps: PropTypes.shape({}),
  onSubmit: PropTypes.func,
  onSubmitFailure: PropTypes.func,
  onSubmitSuccess: PropTypes.func,
};

AddTicketerForm.defaultProps = {
  FormikProps: null,
  onSubmit: null,
  onSubmitFailure: null,
  onSubmitSuccess: null,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  createPartner: partnersActions.createPartner,
};

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
)(AddTicketerForm);
