import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography/Typography';
import Select from '@material-ui/core/Select';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  root: {
    width: 480,
    padding: theme.spacing.unit * 2,
  },
  dialogBodyText: {
    paddingBottom: theme.spacing.unit * 1.8,
  },
});

const PromotionDialog = ({
  classes, error, onClose, onSubmit, open, sightEvents,
}) => {
  const [promotedSightEvent, setPromotedSightEvent] = useState({ id: '', value: '' });
  const { id, value } = promotedSightEvent;
  const handleClose = () => {
    onClose();
    setPromotedSightEvent({ id: '', value: '' });
  }
  return (
    <Dialog
      aria-labelledby="dialog-title"
      aria-describedby="alert-dialog-description"
      onClose={handleClose}
      open={open}
    >
      <DialogTitle id="alert-dialog-title">Promocja oferty</DialogTitle>
      <DialogContent className={classes.root}>
        <DialogContentText
          id="alert-dialog-description"
          className={classes.dialogBodyText}
        >
          Wybierz ofertę, którą chcesz promować
        </DialogContentText>
        <Grid container justify="space-between" spacing={16}>
          <Grid item md={6}>
            <TextField
              type="number"
              label="Kolejność"
              fullWidth
              value={value}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 1, max: 3 }}
              onChange={event => setPromotedSightEvent({
                ...promotedSightEvent, value: event.target.value,
              })}
            />
          </Grid>
          <Grid item md={6}>
            <FormControl fullWidth>
              <InputLabel htmlFor="sight-events-select" shrink>Oferta</InputLabel>
              <Select
                id="sight-events-select"
                value={id}
                onChange={event => setPromotedSightEvent({
                  ...promotedSightEvent, id: event.target.value,
                })}
              >
                {
                  sightEvents.map(({ name, id: sightEventId }) => (
                    <MenuItem key={sightEventId} value={sightEventId}>
                      {name || ''}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        {error
          && (
            <Typography style={{ color: 'red' }}>
              Wystąpił błąd podczas zapisywania.
            </Typography>
          )
        }
        <Button onClick={handleClose} color="primary">Anuluj</Button>
        <Button onClick={() => onSubmit(id, value, handleClose)} disabled={!id || !value} color="primary" autoFocus>Zapisz</Button>
      </DialogActions>
    </Dialog>
  );
};

PromotionDialog.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  error: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  sightEvents: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

PromotionDialog.defaultProps = {
  error: false,
};

export default withStyles(styles)(PromotionDialog);
