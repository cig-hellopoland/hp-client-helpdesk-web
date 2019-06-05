import React, { Component } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography/Typography';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';


class SuccessDialog extends Component {
  handleClose = () => {
    const { onClose } = this.props;

    if (onClose) {
      onClose();
    }
  }

  render() {
    const { ...props } = this.props;
    return (
      <Dialog {...props}>
        <DialogTitle>Informacja</DialogTitle>
        <DialogContent>
          <Grid container>
            <Typography>Poprawnie dodano partnera</Typography>
            <Grid container justify="flex-end">
              <Grid item>
                <Button onClick={this.handleClose} color="primary">Zamknij</Button>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  }
}

SuccessDialog.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};

SuccessDialog.defaultProps = {
  onClose: null,
  open: false,
};


export default SuccessDialog;
