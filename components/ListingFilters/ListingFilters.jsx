import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import SearchIcon from '@material-ui/icons/Search';
import { withStyles } from '@material-ui/core/styles';

import { getLocationFilterOptions } from './utils';
import SearchableSelect from './SearchableSelect';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.grey[50],
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing.unit * 2,
  },
  footer: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
  formControl: {
    minWidth: 140,
  },
});

const ListingFilters = ({
  classes, extraFilters, items, onChange, onClear, searchLabel, totalCount, values,
  visibleCount,
}) => {
  const locationOptions = getLocationFilterOptions(items, values);
  const hasActiveFilters = Object.keys(values).some(key => Boolean(values[key]));

  const locationFilters = [
    {
      key: 'voivodeship', label: 'Województwo', options: locationOptions.voivodeships, searchable: false,
    },
    {
      key: 'county', label: 'Powiat', options: locationOptions.counties, searchable: true,
    },
    {
      key: 'city', label: 'Miasto', options: locationOptions.cities, searchable: true,
    },
  ];
  const normalizedExtraFilters = extraFilters.map(filter => ({
    ...filter,
    searchable: filter.searchable == null ? filter.key !== 'status' : filter.searchable,
  }));
  const primaryFilters = locationFilters.concat(
    normalizedExtraFilters.filter(filter => filter.key === 'status'),
  );
  const secondaryFilters = normalizedExtraFilters.filter(filter => filter.key !== 'status');
  const secondaryColumnWidth = secondaryFilters.length
    ? Math.max(2, Math.floor(12 / secondaryFilters.length))
    : 12;
  const filterLayout = primaryFilters
    .map(filter => ({ filter, md: 2, sm: 4 }))
    .concat(secondaryFilters.map(filter => ({
      filter, md: secondaryColumnWidth, sm: secondaryColumnWidth,
    })));

  return (
    <Grid container spacing={16} alignItems="flex-end" className={classes.root}>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          label={searchLabel}
          name="filterText"
          value={values.filterText || ''}
          onChange={onChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      {filterLayout.map(({ filter, md, sm }) => (
        <Grid item xs={6} sm={sm} md={md} key={filter.key}>
          {filter.searchable ? (
            <SearchableSelect
              label={filter.label}
              name={filter.key}
              onChange={onChange}
              options={filter.options}
              value={values[filter.key] || ''}
            />
          ) : (
            <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor={`listing-filter-${filter.key}`}>{filter.label}</InputLabel>
              <Select
                value={values[filter.key] || ''}
                onChange={onChange}
                inputProps={{
                  id: `listing-filter-${filter.key}`,
                  name: filter.key,
                }}
                MenuProps={{
                  PaperProps: {
                    style: { maxHeight: 48 * 6 },
                  },
                }}
              >
                <MenuItem value="">
                  <em>Wszystkie</em>
                </MenuItem>
                {filter.options.map(option => (
                  <MenuItem key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Grid>
      ))}
      <Grid item xs={12} className={classes.footer}>
        <Typography variant="caption">
          {`Wyniki: ${visibleCount} z ${totalCount}`}
        </Typography>
        <Button size="small" onClick={onClear} disabled={!hasActiveFilters}>
          Wyczyść filtry
        </Button>
      </Grid>
    </Grid>
  );
};

ListingFilters.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  extraFilters: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    })).isRequired,
    searchable: PropTypes.bool,
  })),
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  searchLabel: PropTypes.string.isRequired,
  totalCount: PropTypes.number.isRequired,
  values: PropTypes.shape({}).isRequired,
  visibleCount: PropTypes.number.isRequired,
};

ListingFilters.defaultProps = {
  extraFilters: [],
};

export default withStyles(styles)(ListingFilters);
