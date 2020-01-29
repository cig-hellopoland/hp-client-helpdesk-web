import React from 'react';
import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import { CheckboxWithLabel, Select, TextField } from 'formik-material-ui';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import formatPrice from 'utils/formatPrice';

const DISCOUNT_TYPES = {
  FLAT: 'FLAT',
  PERCENT: 'PERCENT',
};

const DISCOUNT_TYPES_NAMES = {
  [DISCOUNT_TYPES.FLAT]: 'Kwotowy',
  [DISCOUNT_TYPES.PERCENT]: 'Procentowy',
};

const formattedDiscountType = {
  [DISCOUNT_TYPES.FLAT]: 'zł',
  [DISCOUNT_TYPES.PERCENT]: '%',
};

class TicketDiscountForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      initialValues: this.getInitialValues(props.ticketDefinition),
    };
  }

  getInitialValues = (initialValues) => {
    const { discount = {} } = initialValues || {};

    return {
      hplPart: discount.hplPart || '',
      isCustomCommission: discount.isCustomCommission || false,
      partnerPart: discount.partnerPart || '',
      type: discount.type || '',
      value: discount.value || '',
    };
  };

  calculateDiscountAmount = (discountPrice) => {
    const { ticketDefinition } = this.props;
    const { originalPrice } = ticketDefinition || {};

    return originalPrice - discountPrice;
  };

  calculateDiscountPrice = (type, value) => {
    const { ticketDefinition } = this.props;
    const { originalPrice } = ticketDefinition || {};
    let calculatedValue = 0;

    if (type === DISCOUNT_TYPES.FLAT) {
      calculatedValue = Number(value * 100).toFixed(0);
    }

    if (type === DISCOUNT_TYPES.PERCENT) {
      calculatedValue = Number(originalPrice * value / 100).toFixed(0);
    }

    return originalPrice - calculatedValue;
  };

  calculateBaseCommission = () => {
    const { commissionRate, ticketDefinition } = this.props;
    const { originalPrice } = ticketDefinition || {};

    return Number(originalPrice * commissionRate / 100).toFixed(0);
  };

  calculatePartnerCommision = (baseCommission, discountAmount) => discountAmount - baseCommission;

  render() {
    const { initialValues } = this.state;
    const {
      disabled, enableCustomCommission, FormikProps, onSubmit, ticketDefinition,
    } = this.props;

    return (
      <Formik
        enableReinitialize
        {...FormikProps}
        initialValues={initialValues}
        // validationSchema={this.validationSchema}
        onSubmit={onSubmit}
      >
        {({ dirty, values, ...formikBag } = {}) => (
          <Form autoComplete="off" noValidate style={{ width: '100%' }}>
            {console.log(formikBag, values)}
            <Grid container spacing={24}>
              <Grid item xs={3}>
                <Typography variant="subtitle2" paragraph>Ustawienia</Typography>
                <Grid container direction="column" spacing={16}>
                  <Grid item>
                    <FormControl required style={{ minWidth: 175 }}>
                      <InputLabel htmlFor="discount-type">Rodzaj rabatu</InputLabel>
                      <Field
                        component={Select}
                        disabled={disabled}
                        inputProps={{
                          id: 'discount-type',
                          name: 'type',
                        }}
                        name="type"
                      >
                        {Object.values(DISCOUNT_TYPES).map(discountTypeName => (
                          <MenuItem key={discountTypeName} value={discountTypeName}>
                            {DISCOUNT_TYPES_NAMES[discountTypeName]}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <Field
                      component={TextField}
                      disabled={disabled}
                      label="Wartość rabatu"
                      name="value"
                      required
                      type="number"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {formattedDiscountType[values.type] || ''}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs>
                <Typography variant="subtitle2" paragraph>Finansowanie rabatu</Typography>
                <Typography paragraph>Kwota do podziału: 3.00 zł</Typography>
                {enableCustomCommission && (
                  <Field
                    component={CheckboxWithLabel}
                    disabled={disabled}
                    name="isCustomCommission"
                    Label={{ label: 'Finansowanie niestandardowe' }}
                  />
                )}
                <Grid container spacing={16}>
                  <Grid item>
                    <Field
                      component={TextField}
                      disabled={disabled || !enableCustomCommission || !values.isCustomCommission}
                      label="Partner"
                      name="partnerPart"
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">zł</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Field
                      component={TextField}
                      disabled={disabled || !enableCustomCommission || !values.isCustomCommission}
                      label="Hello! Poland"
                      name="hplPart"
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">zł</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs>
                <Typography variant="subtitle2" paragraph>Podsumowanie</Typography>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Cena przed rabatem:</TableCell>
                      <TableCell align="right">
                        {formatPrice(ticketDefinition.originalPrice)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Wartość rabatu:</TableCell>
                      <TableCell align="right">
                        3.00 zł
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Cena po rabacie:</TableCell>
                      <TableCell align="right">
                        17.00 zł
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    );
  }
}

TicketDiscountForm.propTypes = {
  commissionRate: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  enableCustomCommission: PropTypes.bool,
  FormikProps: PropTypes.shape({}),
  onSubmit: PropTypes.func.isRequired,
  ticketDefinition: PropTypes.shape({
    discount: PropTypes.shape({
      amount: PropTypes.number,
      hplPart: PropTypes.number,
      isCustomCommission: PropTypes.bool,
      partnerPart: PropTypes.number,
      percent: PropTypes.number,
      type: PropTypes.string,
      value: PropTypes.number,
    }),
    originalPrice: PropTypes.number,
  }).isRequired,
};

TicketDiscountForm.defaultProps = {
  disabled: false,
  enableCustomCommission: false,
  FormikProps: null,
};

export default TicketDiscountForm;
