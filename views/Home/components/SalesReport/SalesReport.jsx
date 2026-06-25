import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect, ReactReduxContext } from 'react-redux';
import format from 'date-fns/format';
import withStyles from '@material-ui/core/styles/withStyles';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { actions as bookingsActions } from '@hello-poland/commons/redux/bookings';

const styles = theme => ({
  title: {
    marginBottom: 12,
  },
  filters: {
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  filterItem: {
    marginRight: 24,
  },
  partnerItem: {
    width: 360,
    marginRight: 24,
  },
  dateField: {
    width: 170,
  },
  partnerField: {
    width: 340,
    minWidth: 340,
  },
  actionButton: {
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  actionText: {
    color: '#ff1744',
    cursor: 'pointer',
    fontWeight: 500,
    userSelect: 'none',
    whiteSpace: 'nowrap',
    paddingBottom: 8,
    marginLeft: 8,
  },
  error: {
    color: 'red',
    marginBottom: theme.spacing.unit,
  },
  partnerDropdown: {
    left: 0,
    maxHeight: 320,
    overflowY: 'auto',
    position: 'absolute',
    right: 0,
    top: '100%',
    zIndex: 10,
  },
  partnerDropdownButton: {
    padding: 4,
  },
  partnerMenuItem: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

const STATUS_MAP = {
  CONFIRMED: 'Potwierdzony',
  CANCELLED: 'Anulowany',
  BOOKED: 'Zarezerwowany',
};

const normalizeSearchValue = value => (value || '')
  .toLocaleLowerCase('pl')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const getInitialFromDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return format(date, 'yyyy-MM-dd');
};

const getInitialToDate = () => format(new Date(), 'yyyy-MM-dd');

const formatDateTime = value => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return format(date, 'yyyy-MM-dd HH:mm');
};

const formatDateOnly = value => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return format(date, 'dd.MM.yyyy');
};

class SalesReport extends React.Component {
  state = {
    fromDate: getInitialFromDate(),
    toDate: getInitialToDate(),
    partnerId: '',
    partnerQuery: 'Wszyscy',
    partnerMenuOpen: false,
    partners: [],
    sales: [],
    error: false,
    loading: false,
    emailDialogOpen: false,
    selectedSale: null,
    newEmail: '',
    newEmailError: '',
    sendingToNewEmail: false,
    snackbarOpen: false,
    snackbarMessage: '',
  };

  handleDateChange = key => event => {
    this.setState({ [key]: event.target.value });
  };

  handlePartnerSearchChange = (event) => {
    this.setState({
      partnerId: '',
      partnerQuery: event.target.value,
      partnerMenuOpen: true,
    });
  };

  handlePartnerMenuToggle = () => {
    this.setState(state => ({
      partnerMenuOpen: !state.partnerMenuOpen,
    }));
  };

  handlePartnerMenuClose = () => {
    this.setState(state => ({
      partnerMenuOpen: false,
      partnerQuery: state.partnerId ? state.partnerQuery : 'Wszyscy',
    }));
  };

  handlePartnerFocus = (event) => {
    event.target.select();
    this.setState({ partnerMenuOpen: true });
  };

  handlePartnerSelect = (partner) => {
    this.setState({
      partnerId: partner ? String(partner.id) : '',
      partnerQuery: partner ? partner.name : 'Wszyscy',
      partnerMenuOpen: false,
    });
  };

  getFilteredPartners = () => {
    const { partners, partnerId, partnerQuery } = this.state;
    const selectedPartner = partners.find(
      partner => String(partner.id) === partnerId,
    );
    const selectedPartnerName = selectedPartner && selectedPartner.name;
    const query = partnerQuery === 'Wszyscy'
      || partnerQuery === selectedPartnerName
      ? ''
      : normalizeSearchValue(partnerQuery.trim());

    if (!query) {
      return partners;
    }

    return partners.filter(partner => (
      normalizeSearchValue(partner.name).includes(query)
    ));
  };

  handlePartnerKeyDown = (event) => {
    if (event.key === 'Escape') {
      this.handlePartnerMenuClose();
      return;
    }

    if (event.key === 'Enter') {
      const [firstPartner] = this.getFilteredPartners();

      if (firstPartner) {
        event.preventDefault();
        this.handlePartnerSelect(firstPartner);
      }
    }
  };

  canResend = status => status === 'CONFIRMED';

  resend = (store, orderHash) => {
    store.dispatch(
      bookingsActions.sendTicketsEmail({ orderId: orderHash }),
    );
  };

  openEmailDialog = (row) => {
    this.setState({
      emailDialogOpen: true,
      selectedSale: row,
      newEmail: '',
      newEmailError: '',
    });
  };

  closeEmailDialog = () => {
    const { sendingToNewEmail } = this.state;

    if (sendingToNewEmail) {
      return;
    }

    this.setState({
      emailDialogOpen: false,
      selectedSale: null,
      newEmail: '',
      newEmailError: '',
    });
  };

  handleNewEmailChange = (event) => {
    this.setState({
      newEmail: event.target.value,
      newEmailError: '',
    });
  };

  sendToNewEmail = (store) => {
    const { logicMiddleware } = store || {};
    const { httpClient } = logicMiddleware || {};
    const { selectedSale, newEmail, sendingToNewEmail } = this.state;
    const normalizedEmail = newEmail.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (sendingToNewEmail) {
      return;
    }

    if (!emailPattern.test(normalizedEmail)) {
      this.setState({ newEmailError: 'Podaj poprawny adres e-mail.' });
      return;
    }

    if (!httpClient || !selectedSale) {
      return;
    }

    this.setState({ sendingToNewEmail: true, newEmailError: '' });

    httpClient
      .post(
        `/bookings/${encodeURIComponent(selectedSale.hash)}/sendTicketCopyToEmail`,
        { email: normalizedEmail },
      )
      .then(() => {
        this.setState({
          emailDialogOpen: false,
          selectedSale: null,
          newEmail: '',
          sendingToNewEmail: false,
          snackbarOpen: true,
          snackbarMessage: `Wysłano produkty na adres ${normalizedEmail}.`,
        });
      })
      .catch((error) => {
        const response = error && error.response;
        const data = response && response.data;
        this.setState({
          sendingToNewEmail: false,
          newEmailError: (data && data.message)
            || 'Nie udało się wysłać wiadomości. Spróbuj ponownie.',
        });
      });
  };

  closeSnackbar = () => {
    this.setState({ snackbarOpen: false, snackbarMessage: '' });
  };

  fetchPartners = (store) => {
    const { logicMiddleware } = store || {};
    const { httpClient } = logicMiddleware || {};

    if (!httpClient) {
      return;
    }

    httpClient
      .get('/partners')
      .then((response) => {
        const { data } = response;

        const partners = ((data && data.items) || []).slice();

        partners.sort((a, b) => (a.name || '').localeCompare(
          b.name || '',
          'pl',
          { sensitivity: 'base' },
        ));

        this.setState({ partners });
      })
      .catch(() => {
        this.setState({ partners: [] });
      });
  };

  fetchSales = store => {
    const { logicMiddleware } = store || {};
    const { httpClient } = logicMiddleware || {};
    const { fromDate, toDate, partnerId } = this.state;

    if (!httpClient) {
      return;
    }

    this.setState({
      loading: true,
      error: false,
    });

    const query = [
      `fromDate=${fromDate}`,
      `toDate=${toDate}`,
    ];

    if (partnerId) {
      query.push(`partnerId=${partnerId}`);
    }

    httpClient
      .get(`/analytics/sales?${query.join('&')}`)
      .then(response => {
        const sales = (response.data || []).slice();

        sales.sort(
          (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate),
        );

        this.setState({ sales });
      })
      .catch(() => {
        this.setState({
          sales: [],
          error: true,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  renderTable(store) {
    const { sales } = this.state;

    const headerCellStyle = {
      textAlign: 'left',
      padding: '10px 12px',
      whiteSpace: 'nowrap',
      position: 'sticky',
      top: 0,
      background: '#fff',
      zIndex: 2,
      borderBottom: '1px solid #e0e0e0',
    };

    return (
      <div
        style={{
          marginTop: 16,
          maxHeight: 360,
          overflowY: 'auto',
          overflowX: 'auto',
          borderTop: '1px solid #e0e0e0',
        }}
      >
          <table
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              fontSize: 12,
            }}
          >
          <thead>
            <tr>
              <th style={headerCellStyle}>ID</th>
              <th style={headerCellStyle}>Data zakupu</th>
              <th style={headerCellStyle}>Data wydarzenia</th>
              <th style={headerCellStyle}>Wydarzenie</th>
              <th style={headerCellStyle}>Obiekt</th>
              <th style={headerCellStyle}>Partner</th>
              <th style={headerCellStyle}>Klient</th>
              <th style={headerCellStyle}>Email</th>
              <th style={headerCellStyle}>Status</th>
              <th style={headerCellStyle} />
            </tr>
          </thead>

          <tbody>
            {sales.map((row, index) => (
              <tr
                key={`${row.bookingId}-${index}`}
                style={{ borderTop: '1px solid #e0e0e0' }}
              >
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{row.bookingId}</td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{formatDateTime(row.purchaseDate)}</td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{formatDateOnly(row.eventDate)}</td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{row.sightEventName || '-'}</td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{row.objectName || '-'}</td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{row.partnerName || '-'}</td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{row.customerName || '-'}</td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{row.customerEmail || '-'}</td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  {STATUS_MAP[row.status] || row.status || '-'}
                </td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  <Button
                    disabled={!this.canResend(row.status)}
                    onClick={() => this.resend(store, row.hash)}
                    style={{ fontSize: 12 }}
                  >
                    WYŚLIJ PONOWNIE
                  </Button>
                  <Button
                    color="secondary"
                    disabled={!this.canResend(row.status)}
                    onClick={() => this.openEmailDialog(row)}
                    style={{ fontSize: 12 }}
                  >
                    WYŚLIJ NA NOWY EMAIL
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    const { classes } = this.props;
    const {
      fromDate,
      toDate,
      partnerId,
      partnerQuery,
      partnerMenuOpen,
      error,
      emailDialogOpen,
      selectedSale,
      newEmail,
      newEmailError,
      sendingToNewEmail,
      snackbarOpen,
      snackbarMessage,
    } = this.state;
    const filteredPartners = this.getFilteredPartners();

    return (
      <ReactReduxContext.Consumer>
        {({ store }) => {
          if (this._initialized !== true) {
            this._initialized = true;
            this.fetchPartners(store);
            this.fetchSales(store);
          }

          return (
            <div
              style={{
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <Typography variant="h6" className={classes.title}>
                Ostatnia sprzedaż
              </Typography>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  gap: 24,
                  marginBottom: 16,
                  flexWrap: 'nowrap',
                }}
              >
                <div style={{ width: 170, flex: '0 0 170px' }}>
                  <TextField
                    className={classes.dateField}
                    label="Od"
                    type="date"
                    value={fromDate}
                    onChange={this.handleDateChange('fromDate')}
                    InputLabelProps={{ shrink: true }}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ width: 170, flex: '0 0 170px' }}>
                  <TextField
                    className={classes.dateField}
                    label="Do"
                    type="date"
                    value={toDate}
                    onChange={this.handleDateChange('toDate')}
                    InputLabelProps={{ shrink: true }}
                    style={{ width: '100%' }}
                  />
                </div>

                <div
                  style={{
                    width: 380,
                    flex: '0 0 380px',
                    position: 'relative',
                  }}
                >
                  <ClickAwayListener onClickAway={this.handlePartnerMenuClose}>
                    <div>
                      <TextField
                        fullWidth
                        label="Partner"
                        value={partnerQuery}
                        onChange={this.handlePartnerSearchChange}
                        onFocus={this.handlePartnerFocus}
                        onKeyDown={this.handlePartnerKeyDown}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                className={classes.partnerDropdownButton}
                                onClick={this.handlePartnerMenuToggle}
                                aria-label="Rozwiń listę partnerów"
                              >
                                <ArrowDropDownIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      {partnerMenuOpen && (
                        <Paper className={classes.partnerDropdown}>
                          <MenuItem
                            className={classes.partnerMenuItem}
                            onClick={() => this.handlePartnerSelect(null)}
                          >
                            Wszyscy
                          </MenuItem>

                          {filteredPartners.map(partner => (
                            <MenuItem
                              key={partner.id}
                              className={classes.partnerMenuItem}
                              selected={String(partner.id) === partnerId}
                              onClick={() => this.handlePartnerSelect(partner)}
                            >
                              {partner.name}
                            </MenuItem>
                          ))}

                          {!filteredPartners.length && (
                            <MenuItem
                              className={classes.partnerMenuItem}
                              disabled
                            >
                              Brak wyników
                            </MenuItem>
                          )}
                        </Paper>
                      )}
                    </div>
                  </ClickAwayListener>
                </div>

                <div style={{ flex: '0 0 auto', paddingBottom: 4 }}>
                  <Button
                    color="secondary"
                    onClick={() => this.fetchSales(store)}
                  >
                    Pobierz
                  </Button>
                </div>
              </div>

              {error && (
                <Typography className={classes.error}>
                  Wystąpił błąd podczas pobierania raportu.
                </Typography>
              )}

              {this.renderTable(store)}

              <Dialog
                open={emailDialogOpen}
                onClose={this.closeEmailDialog}
                aria-labelledby="send-to-new-email-title"
              >
                <DialogTitle id="send-to-new-email-title">
                  Wyślij produkty na nowy e-mail
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    {`Zamówienie ${
                      selectedSale ? selectedSale.bookingId : ''
                    }. Wpisz poprawny adres odbiorcy.`}
                  </DialogContentText>
                  <TextField
                    autoFocus
                    fullWidth
                    label="Nowy adres e-mail"
                    type="email"
                    value={newEmail}
                    onChange={this.handleNewEmailChange}
                    error={Boolean(newEmailError)}
                    helperText={newEmailError}
                    disabled={sendingToNewEmail}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        this.sendToNewEmail(store);
                      }
                    }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={this.closeEmailDialog}
                    disabled={sendingToNewEmail}
                  >
                    Anuluj
                  </Button>
                  <Button
                    color="secondary"
                    onClick={() => this.sendToNewEmail(store)}
                    disabled={sendingToNewEmail}
                  >
                    {sendingToNewEmail ? 'Wysyłanie...' : 'Wyślij'}
                  </Button>
                </DialogActions>
              </Dialog>

              <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={snackbarOpen}
                autoHideDuration={5000}
                onClose={this.closeSnackbar}
                message={snackbarMessage}
              />
            </div>
          );
        }}
      </ReactReduxContext.Consumer>
    );
  }
}

SalesReport.propTypes = {
  classes: PropTypes.shape({}).isRequired,
};

export default compose(
  connect(() => ({})),
  withStyles(styles),
)(SalesReport);
