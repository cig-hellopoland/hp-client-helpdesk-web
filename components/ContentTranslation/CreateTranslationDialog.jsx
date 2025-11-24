import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { getLanguageLabel } from 'utils/translations';

class CreateTranslationDialog extends React.Component {
  state = {
    selected: null,
  };

  handleChange = (event) => {
    const { value } = event.target;

    this.setState({
      selected: value,
    });
  };

  resetState = () => {
    this.setState({
      selected: null,
    });
  };

  handleCancel = () => {
    const { onCancel } = this.props;

    if (onCancel) {
      onCancel();
    }

    this.resetState();
  };

  handleClose = () => {
    const { onClose } = this.props;

    if (onClose) {
      onClose();
    }

    this.resetState();
  };

  handleSuccess = () => {
    const { onSuccess } = this.props;
    const { selected } = this.state;

    if (onSuccess && selected) {
      onSuccess(selected);
      this.resetState();
    }
  };

  render() {
    const {
      onCancel, // używane tylko do warunku renderowania przycisku
      onCancelText,
      onClose,
      onCloseText,
      onSuccess,
      onSuccessText,
      translations,
      ...props
    } = this.props;

    const { selected } = this.state;

    return (
      <Dialog {...props}>
        <DialogTitle>
          Dodaj tłumaczenie
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel shrink={!!selected} htmlFor="translation-select">
              Wybierz język
            </InputLabel>
            <Select
              value={selected || ''}
              onChange={this.handleChange}
              inputProps={{
                id: 'translation-select',
              }}
            >
              {translations.map(item => (
                <MenuItem key={item} value={item}>
                  {getLanguageLabel(item, { locale: 'pl-PL' })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          {onClose && (
            <Button onClick={this.handleClose} color="primary">
              {onCloseText}
            </Button>
          )}
          {onCancel && (
            <Button onClick={this.handleCancel} color="primary">
              {onCancelText}
            </Button>
          )}
          {onSuccess && (
            <Button
              onClick={this.handleSuccess}
              disabled={!selected}
              color="primary"
            >
              {onSuccessText}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }
}

CreateTranslationDialog.propTypes = {
  onCancel: PropTypes.func,
  onCancelText: PropTypes.string,
  onClose: PropTypes.func,
  onCloseText: PropTypes.string,
  onSuccess: PropTypes.func,
  onSuccessText: PropTypes.string,
  translations: PropTypes.arrayOf(PropTypes.string).isRequired,
};

CreateTranslationDialog.defaultProps = {
  onCancel: null,
  onCancelText: 'Anuluj',
  onClose: null,
  onCloseText: 'Zamknij',
  onSuccess: null,
  onSuccessText: 'OK',
};

export default CreateTranslationDialog;
