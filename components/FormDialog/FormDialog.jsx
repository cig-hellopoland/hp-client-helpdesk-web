import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography/Typography';

const FormDialog = ({
  contentText, children, disabled, error, onClose, onSubmit, open, title,
}) => (
  <Dialog
    aria-labelledby="dialog-title"
    aria-describedby="alert-dialog-description"
    onClose={onClose}
    open={open}
  >
    <DialogTitle id="alert-dialog-title">{title || ''}</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">{contentText}</DialogContentText>
      {children}
    </DialogContent>
    <DialogActions>
      {error
        && (
          <Typography style={{ color: 'red' }}>
            Wystąpił błąd podczas zapisywania.
          </Typography>
        )
      }
      {onClose && <Button onClick={onClose} color="primary">Anuluj</Button>}
      {onSubmit && <Button onClick={onSubmit} disabled={disabled} color="primary" autoFocus>Zapisz</Button>}
    </DialogActions>
  </Dialog>
);

FormDialog.propTypes = {
  contentText: PropTypes.string,
  children: PropTypes.element.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
};

FormDialog.defaultProps = {
  contentText: '',
  disabled: false,
  error: false,
  title: '',
};

export default FormDialog;
