import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect, ReactReduxContext } from 'react-redux';
import format from 'date-fns/format';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
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
  selectRoot: {
    width: '100%',
  },

  selectValue: {
    paddingRight: 32,
    whiteSpace: 'nowrap',
  },

  selectIcon: {
    right: 0,
    top: 'calc(50% - 12px)',
    pointerEvents: 'none',
  },
});

const STATUS_MAP = {
  CONFIRMED: 'Potwierdzony',
  CANCELLED: 'Anulowany',
  BOOKED: 'Zarezerwowany',
};

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
    partners: [],
    sales: [],
    error: false,
    loading: false,
  };

  handleDateChange = key => event => {
    this.setState({ [key]: event.target.value });
  };

  handlePartnerChange = event => {
    this.setState({ partnerId: event.target.value });
  };

  canResend = status => status === 'CONFIRMED';

  resend = (store, orderHash) => {
    store.dispatch(
      bookingsActions.sendTicketsEmail({ orderId: orderHash }),
    );
  };

  fetchPartners = store => {
    const { logicMiddleware } = store || {};
    const { httpClient } = logicMiddleware || {};

    if (!httpClient) {
      return;
    }

    httpClient
      .get('/partners')
      .then(response => {
        const { data } = response;

        this.setState({
          partners: (data && data.items) || [],
        });
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
      partners,
      error,
    } = this.state;

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

                <div style={{ width: 380, flex: '0 0 380px' }}>
                  <FormControl fullWidth>
                    <InputLabel shrink>Partner</InputLabel>
                      <Select
                        value={partnerId}
                        onChange={this.handlePartnerChange}
                        displayEmpty
                        classes={{
                          root: classes.selectRoot,
                          select: classes.selectValue,
                          icon: classes.selectIcon,
                        }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 320,
                              maxWidth: 520,
                            },
                          },
                          getContentAnchorEl: null,
                        }}
                      >
                        <MenuItem value="">Wszyscy</MenuItem>

                        {partners.map(partner => (
                          <MenuItem key={partner.id} value={String(partner.id)}>
                            {partner.name}
                          </MenuItem>
                        ))}
                      </Select>
                  </FormControl>
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
