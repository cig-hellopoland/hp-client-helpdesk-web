import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconGallery from './IconGallery';
import Button from '@material-ui/core/Button';

function IconGalleryDialog({ onClose, onSelect, ...dialogProps }) {
  function handleIconSelect(iconURL) {
    if (onSelect) {
      onSelect(iconURL);
    }

    if (onClose) {
      onClose();
    }
  }

  return (
    <Dialog {...dialogProps} onClose={onClose} aria-labelledby="icon-gallery-dialog">
      <DialogTitle>Wybierz ikonę kategorii</DialogTitle>
      <DialogContent>
        <IconGallery onSelect={handleIconSelect} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Zamknij</Button>
      </DialogActions>
    </Dialog>
  );
}

IconGalleryDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default IconGalleryDialog;
