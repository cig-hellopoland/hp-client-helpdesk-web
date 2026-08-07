import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import Router from 'next/router';
import yupObject from 'yup/lib/object';
import yupString from 'yup/lib/string';
import Layout from 'components/Layout';
import { requestPasswordReset } from 'services/passwordReset';

const styles = theme => ({
  root: {
    height: '100vh',
    marginLeft: 'auto',
  },
  card: {
    width: 400,
  },
  cardActions: {
    justifyContent: 'space-between',
  },
  container: {
    height: '100%',
  },
  error: {
    color: theme.palette.error.main,
    marginTop: theme.spacing.unit,
  },
});

class ForgotPassword extends Component {
  state = {
    error: false,
    sent: false,
  };

  validationSchema = yupObject().shape({
    email: yupString()
      .email('Podaj prawidłowy adres e-mail.')
      .required('Adres e-mail jest wymagany.'),
  });

  handleSubmit = async ({ email }, { setSubmitting }) => {
    this.setState({ error: false });

    try {
      await requestPasswordReset(email);
      this.setState({ sent: true });
    } catch (error) {
      this.setState({ error: Boolean(error) });
    } finally {
      setSubmitting(false);
    }
  };

  render() {
    const { classes } = this.props;
    const { error, sent } = this.state;

    return (
      <Layout allowAnonymous ContentProps={{ className: classes.root }}>
        <Grid container justify="center" alignItems="center" className={classes.container}>
          <Formik
            initialValues={{ email: '' }}
            validationSchema={this.validationSchema}
            onSubmit={this.handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <Card className={classes.card}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Reset hasła
                    </Typography>
                    {sent ? (
                      <Typography>
                        Jeśli konto istnieje, wysłaliśmy wiadomość z linkiem do ustawienia
                        nowego hasła.
                      </Typography>
                    ) : (
                      <Field
                        name="email"
                        label="Adres e-mail"
                        component={TextField}
                        fullWidth
                        margin="normal"
                        required
                      />
                    )}
                    {error && (
                      <Typography className={classes.error}>
                        Nie udało się wysłać wiadomości. Spróbuj ponownie.
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions className={classes.cardActions}>
                    <Button
                      color="primary"
                      onClick={() => Router.push('/sign-in')}
                      type="button"
                    >
                      Powrót do logowania
                    </Button>
                    {!sent && (
                      <Button color="primary" disabled={isSubmitting} type="submit">
                        Wyślij link
                      </Button>
                    )}
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

ForgotPassword.propTypes = {
  classes: PropTypes.shape({}).isRequired,
};

export default withStyles(styles)(ForgotPassword);
