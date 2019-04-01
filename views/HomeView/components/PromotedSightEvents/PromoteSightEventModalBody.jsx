import React from 'react';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

const PromoteSightEventsModalBody = ({ InputNumberProps, SelectProps, sightEvents }) => (
  <Grid container justify="space-between">
    <TextField type="number" {...InputNumberProps} style={{ width: 130 }} />
    <FormControl style={{ width: 130 }}>
      <InputLabel htmlFor="sight-events-select" shrink>Oferta</InputLabel>
      <Select
        {...SelectProps}
        id="sight-events-select"
      >
        {
          sightEvents.map(({ name, id }) => (
            <MenuItem key={id} value={id}>
              {name}
            </MenuItem>
          ))
        }
      </Select>
    </FormControl>
  </Grid>
);

PromoteSightEventsModalBody.propTypes = {
  InputNumberProps: PropTypes.shape({
    inputProps: PropTypes.shape({}).isRequired,
    InputLabelProps: PropTypes.shape({}).isRequired,
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
  SelectProps: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.number.isRequired,
  }).isRequired,
  sightEvents: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default PromoteSightEventsModalBody;
