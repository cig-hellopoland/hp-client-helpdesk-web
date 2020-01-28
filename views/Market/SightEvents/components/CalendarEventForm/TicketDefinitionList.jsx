import React from 'react';
import PropTypes from 'prop-types';
import _isNumber from 'lodash/isNumber';
import List from '@material-ui/core/List/List';
import ListItem from '@material-ui/core/ListItem/ListItem';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction/ListItemSecondaryAction';
import TextField from '@material-ui/core/TextField';
import CardGiftcardIcon from '@material-ui/icons/CardGiftcard';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton/IconButton';
import formatPrice from './utils/formatPrice';

const DISCOUNT_TYPES = {
  FLAT: 'FLAT',
  PERCENT: 'PERCENT',
};

const formattedDiscountType = {
  [DISCOUNT_TYPES.FLAT]: 'zł',
  [DISCOUNT_TYPES.PERCENT]: '%',
};

class TicketDefinitionList extends React.Component {
  state = {
    discountSettings: [],
  };

  getPriceTag = (ticketDefinition) => {
    const {
      discountType, discountValue, price, originalPrice,
    } = ticketDefinition;
    let result = `Cena biletu: ${formatPrice(originalPrice)}`;

    if (price === originalPrice) {
      return result;
    }

    result = `${result} / Cena promocyjna: ${formatPrice(price)}`;

    if (discountType && discountValue) {
      result = `${result} (rabat: ${discountValue} ${formattedDiscountType[discountType]})`;
    }

    return result;
  };

  handleChange = (item) => {
    const { onChange } = this.props;

    if (onChange) {
      onChange(item);
    }
  };

  handleDelete = (item) => {
    const { onDelete } = this.props;

    if (onDelete) {
      onDelete(item);
    }
  };

  parsePropertyValue = (name, value) => {
    if (name === 'availableTicketsNumber') {
      const parsedValue = Number(value);
      return parsedValue > 0 ? parsedValue : -1;
    }

    return value;
  };

  handlePropertyChange = (event, item) => {
    const { name, value } = event.target || {};

    if (name) {
      this.handleChange({ ...item, [name]: this.parsePropertyValue(name, value) });
    }
  };

  toggleDiscountSettings = (itemId) => {
    const { discountSettings } = this.state;

    if (discountSettings.includes(itemId)) {
      const itemIndex = discountSettings.indexOf(itemId);

      discountSettings.splice(itemIndex, 1);
    } else {
      discountSettings.push(itemId);
    }

    this.setState({ discountSettings });
  };

  render() {
    const { discountSettings } = this.state;
    const { items, onDelete, readOnly } = this.props;

    return (items && items.length
      ? (
        <List component="div">
          {items.map((item) => {
            const key = `${item.name}-${item.id}`;
            const isDisabled = readOnly;
            const hasDiscount = !!item.discuntValue;
            const availableTicketsNumber = item.availableTicketsNumber > 0
              ? item.availableTicketsNumber
              : '';

            return (
              <React.Fragment>
                <ListItem key={key}>
                  <ListItemText primary={item.name} required secondary={this.getPriceTag(item)} />
                  <ListItemSecondaryAction>
                    <TextField
                      style={{ width: '150px' }}
                      helperText="Puste pole - brak limitu"
                      label="Limit biletów"
                      disabled={isDisabled}
                      onChange={event => this.handlePropertyChange(event, item)}
                      name="availableTicketsNumber"
                      type="number"
                      value={availableTicketsNumber}
                    />
                    <IconButton
                      aria-label="Ustawienia rabatu"
                      onClick={() => this.toggleDiscountSettings(item.id)}
                      title="Ustawienia rabatu"
                    >
                      <CardGiftcardIcon color={hasDiscount ? 'primary' : 'inherit'} />
                    </IconButton>
                    {!readOnly && onDelete && (
                      <IconButton
                        aria-label="Usuń bilet z puli"
                        onClick={() => this.handleDelete(item)}
                        title="Usuń bilet z puli"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                {discountSettings.includes(item.id) && (
                  <div>omg, settings!</div>
                )}
              </React.Fragment>
            );
          })}
        </List>
      )
      : null
    );
  }
}

TicketDefinitionList.propTypes = {
  disableAvailability: PropTypes.bool, // rem
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    availableTicketsNumber: PropTypes.number,
  })).isRequired, // rename
  readOnly: PropTypes.bool,
};

TicketDefinitionList.defaultProps = {
  disableAvailability: false,
  onChange: null,
  onDelete: null,
  readOnly: false,
};

export default TicketDefinitionList;
