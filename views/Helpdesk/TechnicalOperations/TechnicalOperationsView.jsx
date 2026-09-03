import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect, ReactReduxContext } from 'react-redux';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import LinearProgress from '@material-ui/core/LinearProgress';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Snackbar from '@material-ui/core/Snackbar';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import RefreshIcon from '@material-ui/icons/Refresh';
import Layout from 'components/Layout';
import { selectors as profileSelectors } from 'redux/profile';
import withAuth from 'services/auth/withAuth';

const TERMINAL_STATUSES = ['SUCCEEDED', 'SKIPPED', 'FAILED'];

const styles = {
  content: { padding: 16, width: '100%' },
  header: { marginBottom: 16 },
  headerButton: { marginLeft: 12 },
  paper: { padding: 16, height: '100%' },
  section: { marginTop: 16 },
  checkValue: { marginTop: 8 },
  ok: { color: '#2e7d32' },
  failed: { color: '#c62828' },
  muted: { color: '#666' },
  tableWrapper: { overflowX: 'auto' },
  log: {
    background: '#111',
    color: '#eee',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 1.5,
    margin: '12px 0 0',
    maxHeight: 420,
    minHeight: 180,
    overflow: 'auto',
    padding: 12,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  danger: { marginTop: 12 },
};

const statusLabels = {
  REQUESTED: 'Oczekuje',
  RUNNING: 'W trakcie',
  SUCCEEDED: 'Zakończono',
  SKIPPED: 'Pominięto restart',
  FAILED: 'Błąd',
};

class TechnicalOperationsView extends React.Component {
  static contextType = ReactReduxContext;

  state = {
    status: null,
    operations: [],
    logs: [],
    logSource: 'wordpress',
    loadingStatus: false,
    loadingLogs: false,
    recoveryDialogOpen: false,
    recoveryReason: '',
    activeOperation: null,
    snackbarOpen: false,
    snackbarMessage: '',
  };

  componentDidMount() {
    if (this.hasAccess()) {
      this.loadInitialData();
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.hasAccess(prevProps.profile) && this.hasAccess()) {
      this.loadInitialData();
    }
  }

  componentWillUnmount() {
    this.stopOperationPolling();
  }

  getHttpClient = () => {
    const { store } = this.context || {};
    const { logicMiddleware } = store || {};
    return logicMiddleware && logicMiddleware.httpClient;
  };

  hasAccess = (profile) => {
    const { profile: currentProfile } = this.props;
    const evaluatedProfile = typeof profile === 'undefined' ? currentProfile : profile;
    return Boolean(
      evaluatedProfile
      && Array.isArray(evaluatedProfile.roles)
      && evaluatedProfile.roles.includes('HELPDESK_TECHNICAL'),
    );
  };

  loadInitialData = () => {
    this.fetchStatus();
    this.fetchLogs();
    this.fetchOperations();
  };

  errorMessage = (error, fallback) => {
    const data = error && error.response && error.response.data;
    return (data && (data.detail || data.message)) || fallback;
  };

  openSnackbar = snackbarMessage => this.setState({ snackbarOpen: true, snackbarMessage });

  closeSnackbar = () => this.setState({ snackbarOpen: false, snackbarMessage: '' });

  fetchStatus = () => {
    const httpClient = this.getHttpClient();
    if (!httpClient) return;
    this.setState({ loadingStatus: true });
    httpClient.get('/technical/status')
      .then(({ data }) => this.setState({ status: data, loadingStatus: false }))
      .catch((error) => {
        this.setState({ loadingStatus: false });
        this.openSnackbar(this.errorMessage(error, 'Nie udało się pobrać stanu systemu.'));
      });
  };

  fetchLogs = () => {
    const httpClient = this.getHttpClient();
    const { logSource } = this.state;
    if (!httpClient) return;
    this.setState({ loadingLogs: true });
    httpClient.get(`/technical/logs/${logSource}`)
      .then(({ data }) => this.setState({ logs: (data && data.lines) || [], loadingLogs: false }))
      .catch((error) => {
        this.setState({ logs: [], loadingLogs: false });
        this.openSnackbar(this.errorMessage(error, 'Nie udało się pobrać logów.'));
      });
  };

  fetchOperations = () => {
    const httpClient = this.getHttpClient();
    if (!httpClient) return;
    httpClient.get('/technical/operations')
      .then(({ data }) => this.setState({ operations: Array.isArray(data) ? data : [] }))
      .catch(() => {});
  };

  handleLogSourceChange = (event) => {
    this.setState({ logSource: event.target.value, logs: [] }, this.fetchLogs);
  };

  openRecoveryDialog = () => this.setState({
    recoveryDialogOpen: true,
    recoveryReason: '',
  });

  closeRecoveryDialog = () => this.setState({
    recoveryDialogOpen: false,
    recoveryReason: '',
  });

  handleRecoveryReasonChange = event => this.setState({ recoveryReason: event.target.value });

  requestRecovery = () => {
    const httpClient = this.getHttpClient();
    const { recoveryReason } = this.state;
    if (!httpClient || recoveryReason.trim().length < 5) return;
    httpClient.post('/technical/recovery/wordpress', { reason: recoveryReason.trim() })
      .then(({ data }) => {
        this.setState({
          activeOperation: data,
          recoveryDialogOpen: false,
          recoveryReason: '',
        });
        this.openSnackbar('Zlecenie zostało przyjęte. Najpierw zostanie sprawdzony stan Portalu.');
        this.fetchOperations();
        this.startOperationPolling(data.requestId);
      })
      .catch(error => this.openSnackbar(
        this.errorMessage(error, 'Nie udało się zlecić odzyskiwania WordPressa.'),
      ));
  };

  startOperationPolling = (requestId) => {
    this.stopOperationPolling();
    this.operationPoll = setInterval(() => this.fetchOperation(requestId), 2000);
    this.fetchOperation(requestId);
  };

  stopOperationPolling = () => {
    if (this.operationPoll) {
      clearInterval(this.operationPoll);
      this.operationPoll = null;
    }
  };

  fetchOperation = (requestId) => {
    const httpClient = this.getHttpClient();
    if (!httpClient) return;
    httpClient.get(`/technical/operations/${requestId}`)
      .then(({ data }) => {
        this.setState({ activeOperation: data });
        if (TERMINAL_STATUSES.includes(data.status)) {
          this.stopOperationPolling();
          this.openSnackbar(data.resultMessage || statusLabels[data.status]);
          this.fetchStatus();
          this.fetchOperations();
        }
      })
      .catch(() => this.stopOperationPolling());
  };

  formatDate = value => (value ? new Date(value).toLocaleString('pl-PL') : '-');

  renderCheck = (label, value) => (
    <Grid item xs={12} sm={6} md={3} key={label}>
      <Paper style={styles.paper}>
        <Typography variant="subtitle1">{label}</Typography>
        {value ? (
          <div style={styles.checkValue}>
            <Typography style={value.ok ? styles.ok : styles.failed}>
              {value.ok ? 'Działa' : 'Problem'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {`${value.message || ''}${value.responseTimeMs !== null && value.responseTimeMs !== undefined
                ? ` (${value.responseTimeMs} ms)` : ''}`}
            </Typography>
          </div>
        ) : <Typography style={styles.muted}>Brak danych</Typography>}
      </Paper>
    </Grid>
  );

  renderStatus = () => {
    const { status } = this.state;
    if (!status) return null;
    return (
      <div>
        <Grid container spacing={16}>
          {this.renderCheck('Portal publiczny', status.wordpressPublic)}
          {this.renderCheck('WordPress lokalnie', status.wordpressLocal)}
          {this.renderCheck('Baza WordPressa', status.wordpressDatabase)}
          {this.renderCheck('Baza HP', status.hpDatabase)}
        </Grid>
        {status.agentMessage && (
          <Typography variant="caption" color="textSecondary">
            {status.agentMessage}
          </Typography>
        )}
        <Paper style={{ ...styles.paper, ...styles.section }}>
          <Typography variant="h6">Kontenery</Typography>
          <div style={styles.tableWrapper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nazwa</TableCell>
                  <TableCell>Stan</TableCell>
                  <TableCell>Obraz</TableCell>
                  <TableCell>Uruchomiony od</TableCell>
                  <TableCell numeric>Restarty</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(status.containers || []).map(container => (
                  <TableRow key={container.name}>
                    <TableCell>{container.name}</TableCell>
                    <TableCell style={container.running ? styles.ok : styles.failed}>
                      {container.status}
                    </TableCell>
                    <TableCell>{container.image || '-'}</TableCell>
                    <TableCell>{this.formatDate(container.startedAt)}</TableCell>
                    <TableCell numeric>{container.restartCount || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Paper>
      </div>
    );
  };

  render() {
    const {
      activeOperation,
      loadingLogs,
      loadingStatus,
      logSource,
      logs,
      operations,
      recoveryDialogOpen,
      recoveryReason,
      snackbarMessage,
      snackbarOpen,
      status,
    } = this.state;

    if (!this.hasAccess()) {
      return (
        <Layout>
          <div style={styles.content}><Paper style={styles.paper}>Brak dostępu.</Paper></div>
        </Layout>
      );
    }

    const operationRunning = activeOperation
      && !TERMINAL_STATUSES.includes(activeOperation.status);
    const canRecover = status && status.agentConfigured && !operationRunning;

    return (
      <Layout>
        <div style={styles.content}>
          <Grid container alignItems="center" justify="space-between" style={styles.header}>
            <Typography variant="h5">Stan systemu</Typography>
            <Button onClick={this.fetchStatus} disabled={loadingStatus}>
              <RefreshIcon />
              Odśwież
            </Button>
          </Grid>
          {loadingStatus && <LinearProgress />}
          {this.renderStatus()}

          <Paper style={{ ...styles.paper, ...styles.section }}>
            <Grid container alignItems="center" spacing={16}>
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="technical-log-source">Źródło logów</InputLabel>
                  <Select
                    inputProps={{ id: 'technical-log-source' }}
                    value={logSource}
                    onChange={this.handleLogSourceChange}
                  >
                    <MenuItem value="wordpress">WordPress debug.log</MenuItem>
                    <MenuItem value="apache">Apache error.log</MenuItem>
                    <MenuItem value="docker">Docker — ostatnie 30 minut</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={7}>
                <Button onClick={this.fetchLogs} disabled={loadingLogs}>
                  <RefreshIcon />
                  Pobierz ostatnie 200 linii
                </Button>
              </Grid>
            </Grid>
            {loadingLogs && <LinearProgress />}
            <pre style={styles.log}>{logs.length ? logs.join('\n') : 'Brak wpisów.'}</pre>
          </Paper>

          <Paper style={{ ...styles.paper, ...styles.section }}>
            <Typography variant="h6">Odzyskiwanie WordPressa</Typography>
            <Typography color="textSecondary">
              System najpierw trzykrotnie sprawdzi Portal. Działający Portal nie zostanie
              zrestartowany.
            </Typography>
            {activeOperation && (
              <Typography style={styles.danger}>
                {`Ostatnie zlecenie: ${statusLabels[activeOperation.status] || activeOperation.status}`}
              </Typography>
            )}
            <Button
              color="secondary"
              variant="contained"
              disabled={!canRecover}
              onClick={this.openRecoveryDialog}
              style={styles.danger}
            >
              Sprawdź i w razie awarii zrestartuj WP
            </Button>

            <Typography variant="h6" style={styles.section}>Historia operacji</Typography>
            <div style={styles.tableWrapper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Użytkownik</TableCell>
                    <TableCell>Powód</TableCell>
                    <TableCell>Wynik</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {operations.map(operation => (
                    <TableRow key={operation.requestId}>
                      <TableCell>{this.formatDate(operation.requestedAt)}</TableCell>
                      <TableCell>{operation.actor}</TableCell>
                      <TableCell>{operation.reason}</TableCell>
                      <TableCell>{statusLabels[operation.status] || operation.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Paper>

          <Dialog open={recoveryDialogOpen} onClose={this.closeRecoveryDialog}>
            <DialogTitle>Potwierdź sprawdzenie i odzyskiwanie WP</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Jeżeli Portal działa, restart zostanie automatycznie pominięty. Podaj powód
                operacji do audytu.
              </DialogContentText>
              <TextField
                autoFocus
                fullWidth
                multiline
                inputProps={{ maxLength: 250 }}
                label="Powód"
                value={recoveryReason}
                onChange={this.handleRecoveryReasonChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.closeRecoveryDialog}>Anuluj</Button>
              <Button
                color="secondary"
                disabled={recoveryReason.trim().length < 5}
                onClick={this.requestRecovery}
              >
                Zleć operację
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            autoHideDuration={5000}
            message={snackbarMessage}
            onClose={this.closeSnackbar}
            open={snackbarOpen}
          />
        </div>
      </Layout>
    );
  }
}

TechnicalOperationsView.propTypes = {
  profile: PropTypes.shape({}).isRequired,
};

const mapStateToProps = state => ({
  profile: profileSelectors.getProfile(state),
});

export default compose(
  withAuth(),
  connect(mapStateToProps),
)(TechnicalOperationsView);
