import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

export default class PromotionDialog extends React.Component {
  state = { id: '' };

  handleSubmit = () => {
    const { onSubmit, sightEvents, saving } = this.props;
    const { id } = this.state;
    if (!saving && sightEvents.some(item => String(item.id) === String(id))) onSubmit(id);
  };

  render() {
    const {
      open, onClose, sightEvents, saving, error,
    } = this.props;
    const { id } = this.state;
    return (
      <Dialog
        open={open}
        onClose={saving ? undefined : onClose}
        fullWidth
        maxWidth="sm"
        aria-labelledby="add-promoted-offer-title"
      >
        <DialogTitle id="add-promoted-offer-title">Dodaj promowaną ofertę</DialogTitle>
        <DialogContent>
          <DialogContentText>Wybrana oferta zostanie dodana na końcu listy.</DialogContentText>
          <TextField
            select
            fullWidth
            label="Oferta"
            value={id}
            disabled={saving}
            onChange={event => this.setState({ id: event.target.value })}
            SelectProps={{ native: false, inputProps: { 'aria-label': 'Oferta' } }}
          >
            {sightEvents.map(item => (
              <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
            ))}
          </TextField>
          {!sightEvents.length && <Typography>Brak kolejnych ofert do dodania.</Typography>}
          {error && <Typography color="error" role="alert">{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>Anuluj</Button>
          <Button onClick={this.handleSubmit} color="primary" disabled={saving || !id}>
            {saving ? 'Dodawanie…' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

PromotionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  sightEvents: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  saving: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
};
