import React from 'react';
import PropTypes from 'prop-types';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

import { filterOptionsByQuery } from './utils';

const ALL_OPTIONS_LABEL = 'Wszystkie';
const MENU_ITEM_HEIGHT = 48;
const VISIBLE_MENU_ITEMS = 6;

const getSelectedOptionLabel = ({ options, value }) => {
  const selectedOption = options.find(
    option => String(option.value) === String(value || ''),
  );
  return selectedOption ? selectedOption.label : ALL_OPTIONS_LABEL;
};

const styles = {
  root: {
    position: 'relative',
  },
  dropdown: {
    left: 0,
    maxHeight: MENU_ITEM_HEIGHT * VISIBLE_MENU_ITEMS,
    overflowY: 'auto',
    position: 'absolute',
    right: 0,
    top: '100%',
    zIndex: 20,
  },
  dropdownButton: {
    padding: 4,
  },
  menuItem: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

export class SearchableSelectInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
      query: getSelectedOptionLabel(props),
      syncedValue: String(props.value || ''),
    };
  }

  static getDerivedStateFromProps(props, state) {
    const nextValue = String(props.value || '');
    if (nextValue === state.syncedValue) {
      return null;
    }
    if (state.menuOpen && !nextValue) {
      return { syncedValue: nextValue };
    }
    return {
      query: getSelectedOptionLabel(props),
      syncedValue: nextValue,
    };
  }

  getFilteredOptions = () => {
    const { options, value } = this.props;
    const { query } = this.state;
    const selectedLabel = getSelectedOptionLabel(this.props);
    const effectiveQuery = query === ALL_OPTIONS_LABEL || (value && query === selectedLabel)
      ? ''
      : query;
    return filterOptionsByQuery(options, effectiveQuery);
  };

  emitChange = (value) => {
    const { name, onChange } = this.props;
    onChange({ target: { name, value } });
  };

  handleInputChange = (event) => {
    const { value } = this.props;
    if (value) {
      this.emitChange('');
    }
    this.setState({
      menuOpen: true,
      query: event.target.value,
    });
  };

  handleFocus = (event) => {
    event.target.select();
    this.setState({ menuOpen: true });
  };

  handleMenuToggle = () => this.setState(state => ({
    menuOpen: !state.menuOpen,
  }));

  handleMenuClose = () => this.setState({
    menuOpen: false,
    query: getSelectedOptionLabel(this.props),
  });

  handleSelect = (option) => {
    this.emitChange(option ? String(option.value) : '');
    this.setState({
      menuOpen: false,
      query: option ? option.label : ALL_OPTIONS_LABEL,
    });
  };

  handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      this.handleMenuClose();
      return;
    }
    if (event.key === 'Enter') {
      const [firstOption] = this.getFilteredOptions();
      if (firstOption) {
        event.preventDefault();
        this.handleSelect(firstOption);
      }
    }
  };

  render() {
    const {
      classes, label, name, value,
    } = this.props;
    const { menuOpen, query } = this.state;
    const filteredOptions = this.getFilteredOptions();

    return (
      <ClickAwayListener onClickAway={this.handleMenuClose}>
        <div className={classes.root}>
          <TextField
            fullWidth
            label={label}
            name={`${name}Query`}
            value={query}
            onChange={this.handleInputChange}
            onFocus={this.handleFocus}
            onKeyDown={this.handleKeyDown}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={`Rozwiń listę: ${label}`}
                    className={classes.dropdownButton}
                    onClick={this.handleMenuToggle}
                  >
                    <ArrowDropDownIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {menuOpen && (
            <Paper className={classes.dropdown}>
              <MenuItem
                className={classes.menuItem}
                selected={!value}
                onClick={() => this.handleSelect(null)}
              >
                {ALL_OPTIONS_LABEL}
              </MenuItem>
              {filteredOptions.map(option => (
                <MenuItem
                  className={classes.menuItem}
                  key={String(option.value)}
                  selected={String(option.value) === String(value)}
                  onClick={() => this.handleSelect(option)}
                >
                  {option.label}
                </MenuItem>
              ))}
              {!filteredOptions.length && (
                <MenuItem className={classes.menuItem} disabled>
                  Brak wyników
                </MenuItem>
              )}
            </Paper>
          )}
        </div>
      </ClickAwayListener>
    );
  }
}

SearchableSelectInput.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  })).isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

SearchableSelectInput.defaultProps = {
  value: '',
};

export default withStyles(styles)(SearchableSelectInput);
