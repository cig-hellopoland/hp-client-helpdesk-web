import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect, ReactReduxContext } from 'react-redux';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Layout from 'components/Layout';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import withAuth from 'services/auth/withAuth';
import {
  actions as profileActions,
  selectors as profileSelectors,
} from 'redux/profile';

const styles = {
  content: {
    padding: 16,
  },
  paper: {
    maxWidth: 720,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    marginBottom: 24,
  },
  avatar: {
    background: '#f50057',
    height: 56,
    marginRight: 16,
    width: 56,
  },
  section: {
    marginTop: 24,
  },
};

const getInitials = (name, email) => {
  const source = (name || email || '').trim();
  if (!source) {
    return '?';
  }
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
};

class AccountPage extends React.Component {
  static contextType = ReactReduxContext;

  state = {
    oldPassword: '',
    password: '',
    showOldPassword: false,
    showPassword: false,
    avatarUploading: false,
    snackbarOpen: false,
    snackbarMessage: '',
  };

  getHttpClient = () => {
    const { store } = this.context || {};
    const { logicMiddleware } = store || {};
    return logicMiddleware && logicMiddleware.httpClient;
  };

  handleChange = name => (event) => {
    const { value } = event.target;
    this.setState({ [name]: value });
  };

  togglePasswordVisibility = name => () => this.setState(state => ({
    [name]: !state[name],
  }));

  preventMouseDown = (event) => {
    event.preventDefault();
  };

  closeSnackbar = () => this.setState({ snackbarOpen: false, snackbarMessage: '' });

  openSnackbar = snackbarMessage => this.setState({ snackbarOpen: true, snackbarMessage });

  changeAvatar = (event) => {
    const httpClient = this.getHttpClient();
    const { fetchProfile } = this.props;
    const fileInput = event.target;
    const file = fileInput.files && fileInput.files[0];

    if (!httpClient || !file) {
      return;
    }

    this.setState({ avatarUploading: true });
    httpClient.put('/users/me/avatar', file, {
      headers: {
        'content-type': file.type || 'image/jpeg',
      },
    })
      .then(() => {
        fetchProfile();
        this.setState({
          avatarUploading: false,
          snackbarOpen: true,
          snackbarMessage: 'Zmieniono avatar',
        });
      })
      .catch(() => this.setState({
        avatarUploading: false,
        snackbarOpen: true,
        snackbarMessage: 'Nie udało się zmienić avatara. Obraz powinien mieć minimum 400px szerokości.',
      }));

    fileInput.value = null;
  };

  changePassword = () => {
    const httpClient = this.getHttpClient();
    const { oldPassword, password } = this.state;
    if (!httpClient || !oldPassword || !password) {
      this.openSnackbar('Podaj obecne i nowe hasło');
      return;
    }
    httpClient.patch('/users/me/password', { oldPassword, password })
      .then(() => this.setState({
        oldPassword: '',
        password: '',
        snackbarOpen: true,
        snackbarMessage: 'Zmieniono hasło',
      }))
      .catch(() => this.openSnackbar('Nie udało się zmienić hasła'));
  };

  render() {
    const { profile } = this.props;
    const {
      avatarUploading, oldPassword, password, showOldPassword, showPassword,
      snackbarMessage, snackbarOpen,
    } = this.state;
    const roles = (profile && profile.roles) || [];
    const name = profile && profile.name;
    const email = profile && profile.email;
    const picture = profile && profile.picture;

    return (
      <Layout>
        <div style={styles.content}>
          <Paper style={styles.paper}>
            <div style={styles.header}>
              <Avatar src={picture || undefined} style={styles.avatar}>
                {!picture && getInitials(name, email)}
              </Avatar>
              <div>
                <Typography variant="h6">{name || email}</Typography>
                <Typography color="textSecondary">{email}</Typography>
                <Button color="secondary" component="label" disabled={avatarUploading}>
                  {avatarUploading ? 'Zapisywanie...' : 'Zmień avatar'}
                  <input
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    hidden
                    onChange={this.changeAvatar}
                    type="file"
                  />
                </Button>
              </div>
            </div>

            <Typography variant="subtitle1">Uprawnienia</Typography>
            <Typography>{roles.length ? roles.join(', ') : '-'}</Typography>

            <div style={styles.section}>
              <Typography variant="subtitle1" gutterBottom>Zmień hasło</Typography>
              <Grid container spacing={16}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Obecne hasło"
                    onChange={this.handleChange('oldPassword')}
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showOldPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                            onClick={this.togglePasswordVisibility('showOldPassword')}
                            onMouseDown={this.preventMouseDown}
                          >
                            {showOldPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nowe hasło"
                    onChange={this.handleChange('password')}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                            onClick={this.togglePasswordVisibility('showPassword')}
                            onMouseDown={this.preventMouseDown}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button color="secondary" onClick={this.changePassword}>Zapisz hasło</Button>
                </Grid>
              </Grid>
            </div>
          </Paper>
          <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            autoHideDuration={4000}
            message={snackbarMessage}
            onClose={this.closeSnackbar}
            open={snackbarOpen}
          />
        </div>
      </Layout>
    );
  }
}

AccountPage.propTypes = {
  fetchProfile: PropTypes.func.isRequired,
  profile: PropTypes.shape({}).isRequired,
};

const mapStateToProps = state => ({
  profile: profileSelectors.getProfile(state),
});

const mapDispatchToProps = {
  fetchProfile: profileActions.fetchProfile,
};

export default compose(
  withAuth(),
  connect(mapStateToProps, mapDispatchToProps),
)(AccountPage);
