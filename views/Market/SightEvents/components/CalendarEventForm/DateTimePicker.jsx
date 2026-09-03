import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import TextField from '@material-ui/core/TextField';
import TimePicker from 'material-ui-pickers/TimePicker';
import format from 'date-fns/format';
import getHours from 'date-fns/getHours';
import getMinutes from 'date-fns/getMinutes';
import isValid from 'date-fns/isValid';
import parseISO from 'date-fns/parseISO';
import setHours from 'date-fns/setHours';
import setMinutes from 'date-fns/setMinutes';

const styles = {
  datePicker: {
    width: 140,
  },
  timePicker: {
    marginLeft: 10,
    width: 45,
  },
  wrapper: {
    display: 'flex',
    alignItems: 'flex-end',
  },
};

const changeTypes = {
  DATE: 'DATE',
  TIME: 'TIME',
};

class DateTimePicker extends Component {
  getDate = (value) => {
    const date = typeof value === 'string' ? parseISO(value) : value;

    return date && isValid(date) ? date : null;
  };

  getDateInputValue = (value) => {
    const date = this.getDate(value);

    return date ? format(date, 'yyyy-MM-dd') : '';
  };

  getMinDateInputValue = () => {
    const { DatePickerProps } = this.props;
    const { disablePast = true, minDate } = DatePickerProps || {};
    const dates = [
      minDate && this.getDate(minDate),
      disablePast && new Date(),
    ].filter(Boolean);

    if (!dates.length) {
      return undefined;
    }

    return format(new Date(Math.max(...dates.map(date => date.getTime()))), 'yyyy-MM-dd');
  };

  handleNativeDateChange = (event) => {
    const date = this.getDate(event.target.value);

    if (date) {
      this.handleChange(changeTypes.DATE)(date);
    }
  };

  handleChange = type => (dateObj) => {
    const { name, onChange } = this.props;
    let nextDateObj;

    if (type === changeTypes.DATE) {
      const { date } = this.props;
      const currentDate = typeof date === 'string' ? parseISO(date) : date;

      nextDateObj = new Date(dateObj);
      nextDateObj = setMinutes(nextDateObj, getMinutes(currentDate));
      nextDateObj = setHours(nextDateObj, getHours(currentDate));
    }

    if (onChange) {
      onChange({
        target: { name, type, value: nextDateObj || dateObj },
      });
    }
  };

  render() {
    const {
      classes, date, DatePickerProps, disabled, fullDay, hasDate, hasTime, label, TimePickerProps,
    } = this.props;
    const dateInputValue = this.getDateInputValue(date);
    const minDateInputValue = this.getMinDateInputValue();
    const maxDateInputValue = this.getDateInputValue(
      DatePickerProps && DatePickerProps.maxDate,
    ) || undefined;
    const dateBeforeMin = minDateInputValue && dateInputValue < minDateInputValue;
    const dateAfterMax = maxDateInputValue && dateInputValue > maxDateInputValue;
    const dateError = dateBeforeMin || dateAfterMax;
    let dateHelperText;

    if (dateBeforeMin) {
      dateHelperText = 'Data jest wcześniejsza niż dozwolona';
    } else if (dateAfterMax) {
      dateHelperText = 'Data jest późniejsza niż dozwolona';
    }

    return (
      <div className={classes.wrapper}>
        {hasDate
        && (
          <TextField
            className={classes.datePicker}
            disabled={disabled || (DatePickerProps && DatePickerProps.disabled)}
            error={Boolean(dateError)}
            helperText={dateHelperText}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              max: maxDateInputValue,
              min: minDateInputValue,
            }}
            label={label}
            margin={(DatePickerProps && DatePickerProps.margin) || 'normal'}
            onChange={this.handleNativeDateChange}
            required
            type="date"
            value={dateInputValue}
          />
        )
        }
        {!fullDay && hasTime
        && (
          <TimePicker
            ampm={false}
            className={classes.timePicker}
            clearable
            margin="normal"
            onChange={this.handleChange(changeTypes.TIME)}
            value={date}
            {...TimePickerProps}
          />
        )
        }
      </div>
    );
  }
}

DateTimePicker.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  date: PropTypes.oneOfType([
    PropTypes.shape({}),
    PropTypes.string,
  ]).isRequired,
  disabled: PropTypes.bool,
  DatePickerProps: PropTypes.shape({}),
  fullDay: PropTypes.bool,
  hasDate: PropTypes.bool,
  hasTime: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  TimePickerProps: PropTypes.shape({}),
};

DateTimePicker.defaultProps = {
  DatePickerProps: undefined,
  disabled: false,
  fullDay: false,
  hasDate: true,
  hasTime: true,
  label: undefined,
  name: undefined,
  TimePickerProps: undefined,
};

export default withStyles(styles)(DateTimePicker);
