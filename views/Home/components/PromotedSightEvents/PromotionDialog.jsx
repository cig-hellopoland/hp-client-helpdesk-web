import React from 'react';
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

class PromotionDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      value: '',
    };
  }

  handleClose = () => {
    const { onClose } = this.props;

    this.setState({ id: '', value: '' });
    onClose();
  };

  handleSubmit = () => {
    const { onSubmit } = this.props;
    const { id, value } = this.state;

    onSubmit(id, value);
    this.setState({ id: '', value: '' });
  };

  handleChangeValue = (event) => {
    this.setState({ value: event.target.value });
  };

  handleChangeId = (event) => {
    this.setState({ id: event.target.value });
  };

  render() {
    const {
      classes, error, open, sightEvents,
    } = this.props;
    const { id, value } = this.state;

    return (
      <Dialog
        aria-labelledby="dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={this.handleClose}
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
                onChange={this.handleChangeValue}
              />
            </Grid>
            <Grid item md={6}>
              <FormControl fullWidth>
                <InputLabel htmlFor="sight-events-select" shrink>Oferta</InputLabel>
                <Select
                  id="sight-events-select"
                  value={id}
                  onChange={this.handleChangeId}
                >
                  {sightEvents.map(({ name, id: sightEventId }) => (
                    <MenuItem key={sightEventId} value={sightEventId}>
                      {name || ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {error && (
            <Typography style={{ color: 'red' }}>
              Wystąpił błąd podczas zapisywania.
            </Typography>
          )}
          <Button onClick={this.handleClose} color="primary">
            Anuluj
          </Button>
          <Button
            onClick={this.handleSubmit}
            disabled={!id || !value}
            color="primary"
            autoFocus
          >
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}


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
