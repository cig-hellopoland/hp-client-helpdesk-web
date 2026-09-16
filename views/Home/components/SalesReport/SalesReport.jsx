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
import formatPrice from '../../../../utils/formatPrice';
import { filterSales, getSalesFilterError, normalizeSearchValue } from './salesFilters';
import { buildSalesCsv, loadCsvColumns, saveCsvColumns } from './salesCsv';

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

const getInitialFromDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return format(date, 'yyyy-MM-dd');
};

const getInitialToDate = () => format(new Date(), 'yyyy-MM-dd');

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return format(date, 'yyyy-MM-dd HH:mm');
};

const formatDateOnly = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return format(date, 'dd.MM.yyyy');
};

const SALES_COLUMNS = [
  { key: 'bookingId', label: 'ID', value: row => row.bookingId },
  { key: 'purchaseDate', label: 'Data zakupu', value: row => formatDateTime(row.purchaseDate) },
  { key: 'eventDate', label: 'Data wydarzenia', value: row => formatDateOnly(row.eventDate) },
  { key: 'sightEventName', label: 'Wydarzenie', value: row => row.sightEventName },
  { key: 'objectName', label: 'Obiekt', value: row => row.objectName },
  {
    key: 'ticketPrice',
    label: 'Cena biletu kupionego',
    value: row => (row.ticketPrice == null ? '' : formatPrice(row.ticketPrice)),
  },
  { key: 'customerName', label: 'Klient', value: row => row.customerName },
  { key: 'customerEmail', label: 'Email', value: row => row.customerEmail },
  { key: 'status', label: 'Status', value: row => STATUS_MAP[row.status] || row.status || '' },
];

const CSV_COLUMN_KEYS = SALES_COLUMNS.map(column => column.key);

const SALES_COLUMN_WIDTHS = [90, 165, 190, 280, 260, 185, 185, 230, 195, 340];

const reportInputProps = {
  style: { height: 32, marginTop: 16 },
};

const columnInputStyle = {
  display: 'block',
  width: '100%',
  minWidth: 0,
  height: 28,
  boxSizing: 'border-box',
  padding: '6px 0 7px',
  border: 0,
  borderBottom: '1px solid rgba(0, 0, 0, 0.42)',
  borderRadius: 0,
  backgroundColor: 'transparent',
  color: 'rgba(0, 0, 0, 0.87)',
  fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  fontSize: 12,
  fontWeight: 400,
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
    columnFilters: {},
    csvColumns: CSV_COLUMN_KEYS.slice(),
    csvColumnsDialogOpen: false,
    error: false,
    loading: false,
    downloading: false,
    emailDialogOpen: false,
    selectedSale: null,
    newEmail: '',
    newEmailError: '',
    sendingToNewEmail: false,
    snackbarOpen: false,
    snackbarMessage: '',
  };

  componentDidMount() {
    this.setState({ csvColumns: loadCsvColumns(CSV_COLUMN_KEYS) });
  }

  openCsvColumnsDialog = () => {
    this.setState({ csvColumnsDialogOpen: true });
  };

  closeCsvColumnsDialog = () => {
    this.setState({ csvColumnsDialogOpen: false });
  };

  setCsvColumns = (selectedKeys) => {
    const { downloading } = this.state;
    if (downloading) return;
    const csvColumns = CSV_COLUMN_KEYS.filter(key => selectedKeys.includes(key));
    this.setState({ csvColumns });
    saveCsvColumns(csvColumns);
  };

  handleCsvColumnChange = key => (event) => {
    const { csvColumns } = this.state;
    this.setCsvColumns(event.target.checked
      ? [...csvColumns, key]
      : csvColumns.filter(selectedKey => selectedKey !== key));
  };

  handleDateChange = key => (event) => {
    this.setState({ [key]: event.target.value });
  };

  handleColumnFilterChange = key => (event) => {
    const { value } = event.target;
    this.setState(state => ({
      columnFilters: { ...state.columnFilters, [key]: value },
    }));
  };

  clearColumnFilters = () => {
    this.setState({ columnFilters: {} });
  };

  getFilteredSales = (rows) => {
    const { columnFilters, sales } = this.state;
    return filterSales(rows || sales, columnFilters);
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

  downloadSalesCsv = (sales) => {
    const { fromDate, toDate, csvColumns } = this.state;
    const csv = buildSalesCsv(sales, SALES_COLUMNS, csvColumns);
    if (!csv) return;
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = objectUrl;
    anchor.download = `hp-ostatnia-sprzedaz_${fromDate.replace(/-/g, '')}-${toDate.replace(/-/g, '')}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  };

  fetchSales = (store, downloadFile = false) => {
    const { logicMiddleware } = store || {};
    const { httpClient } = logicMiddleware || {};
    const {
      fromDate, toDate, partnerId, loading, columnFilters, csvColumns,
    } = this.state;

    if (!httpClient || loading
      || (downloadFile && (!csvColumns.length || getSalesFilterError(columnFilters)))) {
      return;
    }

    this.setState({
      loading: true,
      downloading: downloadFile,
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
      .then((response) => {
        const sales = (response.data || []).slice();

        sales.sort(
          (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate),
        );

        this.setState({ sales });

        if (downloadFile) {
          this.downloadSalesCsv(this.getFilteredSales(sales));
        }
      })
      .catch(() => {
        this.setState({
          sales: [],
          error: true,
        });
      })
      .finally(() => {
        this.setState({ loading: false, downloading: false });
      });
  };

  renderCsvColumnsDialog() {
    const { csvColumns, csvColumnsDialogOpen, downloading } = this.state;
    return (
      <Dialog
        open={csvColumnsDialogOpen}
        onClose={this.closeCsvColumnsDialog}
        aria-labelledby="sales-csv-columns-title"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="sales-csv-columns-title">Kolumny CSV</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Wybierz kolumny do pobrania. Eksport uwzględni aktywne filtry raportu.
          </DialogContentText>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 8 }}>
            <Button
              size="small"
              disabled={downloading || csvColumns.length === CSV_COLUMN_KEYS.length}
              onClick={() => this.setCsvColumns(CSV_COLUMN_KEYS)}
            >
              Zaznacz wszystkie
            </Button>
            <Button
              size="small"
              disabled={downloading || !csvColumns.length}
              onClick={() => this.setCsvColumns([])}
            >
              Odznacz wszystkie
            </Button>
          </div>
          <div role="group" aria-label="Kolumny do eksportu">
            {SALES_COLUMNS.map(column => (
              <label
                key={column.key}
                htmlFor={`sales-csv-column-${column.key}`}
                style={{
                  display: 'flex', alignItems: 'center', minHeight: 34, cursor: 'pointer',
                }}
              >
                <input
                  id={`sales-csv-column-${column.key}`}
                  type="checkbox"
                  checked={csvColumns.includes(column.key)}
                  disabled={downloading}
                  onChange={this.handleCsvColumnChange(column.key)}
                  style={{ width: 16, height: 16, margin: '0 12px 0 0' }}
                />
                <Typography style={{ fontSize: 14 }}>{column.label}</Typography>
              </label>
            ))}
          </div>
          <Typography
            role="status"
            style={{ fontSize: 12, marginTop: 12, color: csvColumns.length ? '#616161' : '#b71c1c' }}
          >
            {csvColumns.length
              ? `Wybrane kolumny: ${csvColumns.length} z ${CSV_COLUMN_KEYS.length}`
              : 'Wybierz co najmniej jedną kolumnę, aby pobrać CSV.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={this.closeCsvColumnsDialog}>Gotowe</Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderColumnFilter(column) {
    const { columnFilters } = this.state;
    if (column.key === 'purchaseDate') {
      return (
        <span style={{
          fontSize: 12, fontWeight: 400, whiteSpace: 'normal', color: '#616161',
        }}
        >
          Zakres „Od–Do” nad raportem
        </span>
      );
    }
    if (column.key === 'eventDate' || column.key === 'ticketPrice') {
      const isDate = column.key === 'eventDate';
      const fields = isDate
        ? [['eventDateFrom', 'Od'], ['eventDateTo', 'Do']]
        : [['ticketPriceMin', 'Min zł'], ['ticketPriceMax', 'Max zł']];
      return fields.map(([key, label]) => (
        <label
          key={key}
          htmlFor={`sales-filter-${key}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 400,
          }}
        >
          <span style={{ flex: isDate ? '0 0 20px' : '0 0 40px' }}>{label}</span>
          <input
            id={`sales-filter-${key}`}
            aria-label={`Filtr: ${column.label} — ${label}`}
            type={isDate ? 'date' : 'text'}
            inputMode={isDate ? undefined : 'decimal'}
            placeholder={isDate ? undefined : 'Bez limitu'}
            value={columnFilters[key] || ''}
            onChange={this.handleColumnFilterChange(key)}
            style={columnInputStyle}
          />
        </label>
      ));
    }
    if (column.key === 'status') {
      return (
        <select
          aria-label="Filtr: Status"
          value={columnFilters.status || ''}
          onChange={this.handleColumnFilterChange('status')}
          style={{ ...columnInputStyle, appearance: 'auto', cursor: 'pointer' }}
        >
          <option value="">Wszystkie</option>
          {Object.keys(STATUS_MAP).map(status => (
            <option key={status} value={status}>{STATUS_MAP[status]}</option>
          ))}
        </select>
      );
    }
    return (
      <TextField
        fullWidth
        value={columnFilters[column.key] || ''}
        onChange={this.handleColumnFilterChange(column.key)}
        placeholder={column.key === 'bookingId' ? 'Numer ID' : 'Filtruj...'}
        InputProps={{
          style: { fontSize: 12, fontWeight: 400, height: 28 },
          inputProps: {
            'aria-label': `Filtr: ${column.label}`,
            inputMode: column.key === 'bookingId' ? 'numeric' : undefined,
            style: { fontSize: 12, fontWeight: 400 },
          },
        }}
        style={{ display: 'block' }}
      />
    );
  }

  renderTable(store) {
    const { sales, columnFilters, loading } = this.state;
    const filteredSales = this.getFilteredSales();
    const hasColumnFilters = Object.values(columnFilters).some(value => value.trim());
    const filterError = getSalesFilterError(columnFilters);

    const headerCellStyle = {
      textAlign: 'left',
      padding: '10px 12px',
      whiteSpace: 'nowrap',
      position: 'sticky',
      top: 0,
      background: '#fff',
      zIndex: 2,
      borderBottom: '1px solid #e0e0e0',
      verticalAlign: 'bottom',
    };

    return (
      <div
        style={{
          marginTop: 16,
          border: '1px solid #bdbdbd',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div style={{
          maxHeight: 360,
          overflowY: 'auto',
          overflowX: 'auto',
        }}
        >
          <table
            style={{
              width: '100%',
              minWidth: SALES_COLUMN_WIDTHS.reduce((total, width) => total + width, 0),
              tableLayout: 'fixed',
              borderCollapse: 'separate',
              borderSpacing: 0,
              fontSize: 12,
            }}
          >
            <colgroup>
              {SALES_COLUMNS.map((column, index) => (
                <col key={column.key} style={{ width: SALES_COLUMN_WIDTHS[index] }} />
              ))}
              <col style={{ width: SALES_COLUMN_WIDTHS[SALES_COLUMNS.length] }} />
            </colgroup>
            <thead>
              <tr>
                {SALES_COLUMNS.map(column => (
                  <th key={column.key} scope="col" style={headerCellStyle}>
                    {column.label}
                    <div style={{ marginTop: 8, height: 56 }}>
                      {this.renderColumnFilter(column)}
                    </div>
                  </th>
                ))}
                <th style={headerCellStyle} />
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((row, index) => (
                <tr
                  key={`${row.bookingId}-${index}`}
                  style={{ borderTop: '1px solid #e0e0e0' }}
                >
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{row.bookingId}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{formatDateTime(row.purchaseDate)}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{formatDateOnly(row.eventDate)}</td>
                  <td style={{ padding: '10px 12px', overflowWrap: 'break-word' }}>{row.sightEventName || '-'}</td>
                  <td style={{ padding: '10px 12px', overflowWrap: 'break-word' }}>{row.objectName || '-'}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    {row.ticketPrice == null ? '-' : formatPrice(row.ticketPrice)}
                  </td>
                  <td style={{ padding: '10px 12px', overflowWrap: 'break-word' }}>{row.customerName || '-'}</td>
                  <td style={{ padding: '10px 12px', overflowWrap: 'break-word' }}>{row.customerEmail || '-'}</td>
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
              {!filteredSales.length && (
              <tr>
                <td colSpan={10} style={{ padding: 24, textAlign: 'center' }}>
                  {loading ? 'Ładowanie danych...' : (filterError || 'Brak sprzedaży dla wybranych filtrów.')}
                </td>
              </tr>
              )}
            </tbody>
          </table>
        </div>
        {filterError && (
          <Typography role="alert" style={{ color: '#b71c1c', padding: '8px 12px', fontSize: 12 }}>
            {filterError}
          </Typography>
        )}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderTop: '1px solid #bdbdbd',
          background: '#f5f5f5',
        }}
        >
          <Typography variant="caption" role="status">
            {`Widoczne pozycje: ${filteredSales.length} z ${sales.length}`}
          </Typography>
          <Button size="small" onClick={this.clearColumnFilters} disabled={!hasColumnFilters}>
            Wyczyść filtry kolumn
          </Button>
        </div>
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
      loading,
      downloading,
      emailDialogOpen,
      selectedSale,
      newEmail,
      newEmailError,
      sendingToNewEmail,
      snackbarOpen,
      snackbarMessage,
      columnFilters,
      csvColumns,
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
                  flexWrap: 'wrap',
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
                    InputProps={reportInputProps}
                    style={{ width: '100%', height: 48 }}
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
                    InputProps={reportInputProps}
                    style={{ width: '100%', height: 48 }}
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
                        style={{ height: 48 }}
                        InputProps={{
                          ...reportInputProps,
                          endAdornment: (
                            <InputAdornment position="end" style={{ height: 32, maxHeight: 32 }}>
                              <IconButton
                                className={classes.partnerDropdownButton}
                                style={{ width: 32, height: 32, padding: 4 }}
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
                    disabled={loading}
                    onClick={() => this.fetchSales(store)}
                  >
                    {loading && !downloading ? 'Odświeżanie...' : 'Odśwież'}
                  </Button>
                  <Button
                    color="secondary"
                    disabled={loading || !csvColumns.length
                      || Boolean(getSalesFilterError(columnFilters))}
                    onClick={() => this.fetchSales(store, true)}
                  >
                    {downloading ? 'Pobieranie...' : 'Pobierz'}
                  </Button>
                  <Button
                    color="secondary"
                    disabled={downloading}
                    onClick={this.openCsvColumnsDialog}
                    aria-haspopup="dialog"
                  >
                    {`Kolumny CSV (${csvColumns.length}/${CSV_COLUMN_KEYS.length})`}
                  </Button>
                </div>
              </div>

              {error && (
                <Typography className={classes.error}>
                  Wystąpił błąd podczas pobierania raportu.
                </Typography>
              )}

              {this.renderTable(store)}
              {this.renderCsvColumnsDialog()}

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
