import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { actions as profileActions, selectors as profileSelectors } from 'redux/profile';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Grid from '@material-ui/core/Grid';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import Router from 'next/router';
import yupObject from 'yup/lib/object';
import yupString from 'yup/lib/string';
import Layout from 'components/Layout';

const styles = () => ({
  root: {
    height: '100vh',
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
  container: {
    height: '100%',
  },
});

const commonProps = {
  fullWidth: true,
  margin: 'normal',
  required: true,
};

class SignInView extends Component {
  initialValues = {
    login: '',
    password: '',
  };

  validationSchema = yupObject().shape({
    login: yupString()
      .min(3)
      .max(250)
      .email()
      .trim()
      .required(),
    password: yupString()
      .min(3)
      .max(250)
      .trim()
      .required(),
  });

  componentDidMount() {
    const { isAuthenticated } = this.props;

    if (isAuthenticated) {
      Router.push('/');
    }
  }

  handleSubmit = (data, actions) => {
    const { login } = this.props;

    login({
      data,
      onFailure: this.handleSubmitFailure(actions),
      onSuccess: this.handleSubmitSuccess,
    });
  };

  handleSubmitFailure = actions => () => {
    const { setSubmitting } = actions;

    debugger;
    setSubmitting(false);
    // TODO: setErrors
  };

  handleSubmitSuccess = () => {
    const { query } = Router.router;
    const url = query.redirect || '/';

    Router.push(url);
  };

  render() {
    const { classes } = this.props;

    return (
      <Layout ContentProps={{ className: classes.root }}>
        <Grid container justify="center" alignItems="center" className={classes.container}>
          <Formik
            initialValues={this.initialValues}
            validationSchema={this.validationSchema}
            onSubmit={this.handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <Card>
                  <CardContent>
                    <Field name="login" label="Login" component={TextField} {...commonProps} />
                    <Field name="password" label="Password" type="password" component={TextField} {...commonProps} />
                  </CardContent>
                  <CardActions className={classes.cardActions}>
                    <Button color="primary" disabled={isSubmitting} type="submit">
                      Sign in
                    </Button>
                  </CardActions>
                </Card>
              </Form>
            )}
          </Formik>
        </Grid>
      </Layout>
    );
  }
}

SignInView.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  error: PropTypes.shape({}),
  isAuthenticated: PropTypes.bool.isRequired,
  login: PropTypes.func.isRequired,
};

SignInView.defaultProps = {
  error: null,
};

const mapStateToProps = state => ({
  error: profileSelectors.getError(state),
  isAuthenticated: profileSelectors.isAuthenticated(state),
});

const mapDispatchToProps = {
  login: profileActions.login,
};

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
)(SignInView);
