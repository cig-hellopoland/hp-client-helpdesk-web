import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import Router from 'next/router';
import yupObject from 'yup/lib/object';
import yupString from 'yup/lib/string';
import Layout from 'components/Layout';
import { confirmPasswordReset } from 'services/passwordReset';

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

class ResetPassword extends Component {
  state = {
    error: false,
    success: false,
    showNewPassword: false,
    showRepeatedPassword: false,
  };

  validationSchema = yupObject().shape({
    newPassword: yupString()
      .min(3, 'Hasło musi mieć co najmniej 3 znaki.')
      .required('Hasło jest wymagane.'),
    repeatedPassword: yupString()
      .test('passwords-match', 'Hasła muszą być takie same.', function passwordsMatch(value) {
        return this.parent.newPassword === value;
      })
      .required('Powtórzenie hasła jest wymagane.'),
  });

  handleSubmit = async ({ newPassword }, { setSubmitting }) => {
    const { query = {} } = Router.router || {};

    this.setState({ error: false });

    try {
      await confirmPasswordReset(query.token, newPassword);
      this.setState({ success: true });
    } catch (error) {
      this.setState({ error: Boolean(error) });
    } finally {
      setSubmitting(false);
    }
  };

  togglePasswordVisibility = name => () => this.setState(state => ({
    [name]: !state[name],
  }));

  preventMouseDown = (event) => {
    event.preventDefault();
  };

  render() {
    const { classes } = this.props;
    const {
      error, success, showNewPassword, showRepeatedPassword,
    } = this.state;

    return (
      <Layout allowAnonymous ContentProps={{ className: classes.root }}>
        <Grid container justify="center" alignItems="center" className={classes.container}>
          <Formik
            initialValues={{ newPassword: '', repeatedPassword: '' }}
            validationSchema={this.validationSchema}
            onSubmit={this.handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <Card className={classes.card}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Ustaw nowe hasło
                    </Typography>
                    {success ? (
                      <Typography>
                        Hasło zostało zmienione. Możesz się teraz zalogować.
                      </Typography>
                    ) : (
                      <React.Fragment>
                        <Field
                          name="newPassword"
                          label="Nowe hasło"
                          type={showNewPassword ? 'text' : 'password'}
                          component={TextField}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label={showNewPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                                  onClick={this.togglePasswordVisibility('showNewPassword')}
                                  onMouseDown={this.preventMouseDown}
                                >
                                  {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          fullWidth
                          margin="normal"
                          required
                        />
                        <Field
                          name="repeatedPassword"
                          label="Powtórz nowe hasło"
                          type={showRepeatedPassword ? 'text' : 'password'}
                          component={TextField}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label={showRepeatedPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                                  onClick={this.togglePasswordVisibility('showRepeatedPassword')}
                                  onMouseDown={this.preventMouseDown}
                                >
                                  {showRepeatedPassword
                                    ? <VisibilityOffIcon />
                                    : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          fullWidth
                          margin="normal"
                          required
                        />
                      </React.Fragment>
                    )}
                    {error && (
                      <Typography className={classes.error}>
                        Link jest nieprawidłowy lub wygasł. Poproś o nowy link.
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
                    {!success && (
                      <Button color="primary" disabled={isSubmitting} type="submit">
                        Zmień hasło
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

ResetPassword.propTypes = {
  classes: PropTypes.shape({}).isRequired,
};

export default withStyles(styles)(ResetPassword);
