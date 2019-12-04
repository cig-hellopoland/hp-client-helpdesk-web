import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import {
  actions as sightEventsActions,
  selectors as sightEventsSelectors,
} from '@hello-poland/commons/redux/sightEvents';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import AlertDialog from 'components/AlertDialog';
import MediaManager from 'components/MediaManager';
import MultimediaSection from 'components/Multimedia/Section';
import { actions as sightsActions } from '@hello-poland/commons/redux/sights';

const UPLOAD_TYPE = {
  ATTACHMENT: 'ATTACHMENT',
  GALLERY: 'GALLERY',
  MAIN_IMAGE: 'MAIN_IMAGE',
};

const styles = theme => ({
  fetchButton: {
    marginTop: theme.spacing.unit * 3,
  },
  image: {
    color: theme.palette.grey[500],
    fontSize: theme.spacing.unit * 10,
  },
  section: {
    '& ~ &': {
      marginTop: theme.spacing.unit * 5,
    },
  },
});

class SightEventMultimediaForm extends React.Component {
  state = {
    alertDialog: {
      content: '',
      open: false,
      title: '',
      onSuccess: null,
    },
    mediaManager: false,
    mediaManagerData: {},
  };

  handleAlertDialogCancel = () => this.setState({
    alertDialog: {
      content: '',
      open: false,
      title: '',
      onSuccess: null,
    },
  });

  handleDelete = (fileId, { name, type }) => {
    const alertDialog = {
      content: `Plik ${name} zostanie trwale usunięty i nie będzie można go przywrócic.`,
      open: true,
      title: 'Czy na pewno usunąć wybrany plik?',
    };

    if (type === UPLOAD_TYPE.ATTACHMENT) {
      alertDialog.onSuccess = () => {
        this.handleDeletePDF(fileId);
        this.handleAlertDialogCancel();
      };
    } else if (type === UPLOAD_TYPE.GALLERY) {
      alertDialog.onSuccess = () => {
        this.handleImageDelete(fileId);
        this.handleAlertDialogCancel();
      };
    }

    this.setState({ alertDialog });
  };

  handleImageDelete = (imageId) => {
    const { deleteImage, itemId } = this.props;

    deleteImage({
      id: imageId,
      itemId,
      onFailure: this.handleImageDeleteFailure,
      onSuccess: this.handleImageDeleteSuccess,
    });
  };

  handleImageDeleteFailure = () => {
    const { onFailure } = this.props;

    if (onFailure) {
      onFailure();
    }
  };

  handleImageDeleteSuccess = () => {
    const { onSuccess } = this.props;

    if (onSuccess) {
      onSuccess();
    }
  };

  handleDeletePDFFailure = () => {
    const { onFailure } = this.props;

    if (onFailure) {
      onFailure();
    }
  };

  handleDeletePDFSuccess = () => {
    const { onSuccess } = this.props;

    if (onSuccess) {
      onSuccess();
    }
  };

  handleDeletePDF = () => {
    const { deletePDF, itemId } = this.props;

    const payload = {
      id: itemId,
      onFailure: this.handleDeletePDFFailure,
      onSuccess: this.handleDeletePDFSuccess,
    };

    deletePDF(payload);
  };

  handleMediaManagerClose = () => {
    const {
      clearError, createImageCancel, createMainImageCancel, createPDFCancel,
    } = this.props;
    const { mediaManagerData } = this.state;
    const { uploadType } = mediaManagerData;
    let action = () => {};

    this.setState({
      mediaManager: false,
      mediaManagerData: {},
    });

    if (uploadType === UPLOAD_TYPE.MAIN_IMAGE) {
      action = createMainImageCancel;
    } else if (uploadType === UPLOAD_TYPE.GALLERY) {
      action = createImageCancel;
    } else if (uploadType === UPLOAD_TYPE.ATTACHMENT) {
      action = createPDFCancel;
    }

    action();
    clearError();
  };

  handleMediaManagerSubmitFailure = () => {
    const { onFailure } = this.props;

    if (onFailure) {
      onFailure();
    }
  };

  handleMediaManagerSubmitSuccess = () => {
    const { onSuccess } = this.props;

    if (onSuccess) {
      onSuccess();
    }

    this.handleMediaManagerClose();
  };

  handleMediaManagerSubmit = ({ data, options }) => {
    const { createImage, createMainImage, createPDF } = this.props;
    const { mediaManagerData } = this.state;
    const { uploadType, itemId } = mediaManagerData;
    let action = () => {};

    if (uploadType === UPLOAD_TYPE.MAIN_IMAGE) {
      action = createMainImage;
    } else if (uploadType === UPLOAD_TYPE.GALLERY) {
      action = createImage;
    } else if (uploadType === UPLOAD_TYPE.ATTACHMENT) {
      action = createPDF;
    }

    action({
      id: itemId,
      data,
      options,
      onFailure: this.handleMediaManagerSubmitFailure,
      onSuccess: this.handleMediaManagerSubmitSuccess,
    });
  };

  handleUploadModalOpen = (itemId, uploadType) => this.setState({
    mediaManager: true,
    mediaManagerData: {
      itemId,
      uploadType,
    },
  });

  render() {
    const { alertDialog, mediaManager } = this.state;
    const {
      classes, data, defaultTranslation, itemId, requestError, translation,
    } = this.props;
    const isDefaultTranslation = defaultTranslation === translation;

    const mainImage = data.mainImage ? [data.mainImage] : [];
    const images = data.images ? data.images : [];
    const attachments = data.attachments ? data.attachments : [];

    return (
      <React.Fragment>
        <div className={classes.section}>
          <Grid container alignItems="center" justify="space-between">
            <Grid item>
              <Typography variant="h6">Zdjęcie promocyjne</Typography>
            </Grid>
            <Grid item>
              <IconButton
                aria-label="Dodaj"
                disabled={!isDefaultTranslation}
                onClick={() => this.handleUploadModalOpen(itemId, UPLOAD_TYPE.MAIN_IMAGE)}
                title="Dodaj"
              >
                <AddIcon />
              </IconButton>
            </Grid>
          </Grid>
          <MultimediaSection items={mainImage} sectionType={UPLOAD_TYPE.MAIN_IMAGE} />
        </div>
        <div className={classes.section}>
          <Grid container alignItems="center" justify="space-between">
            <Grid item>
              <Typography variant="h6">Galeria zdjęć</Typography>
            </Grid>
            <Grid item>
              <IconButton
                aria-label="Dodaj"
                disabled={!isDefaultTranslation}
                onClick={() => this.handleUploadModalOpen(itemId, UPLOAD_TYPE.GALLERY)}
                title="Dodaj"
              >
                <AddIcon />
              </IconButton>
            </Grid>
          </Grid>
          <MultimediaSection
            items={images}
            sectionType={UPLOAD_TYPE.GALLERY}
            onDelete={this.handleDelete}
          />
        </div>
        <div className={classes.section}>
          <Grid container alignItems="center" justify="space-between">
            <Grid item>
              <Typography variant="h6">Pliki</Typography>
            </Grid>
            <Grid item>
              <IconButton
                aria-label="Dodaj"
                disabled={!isDefaultTranslation}
                onClick={() => this.handleUploadModalOpen(itemId, UPLOAD_TYPE.ATTACHMENT)}
                title="Dodaj"
              >
                <AddIcon />
              </IconButton>
            </Grid>
          </Grid>
          <MultimediaSection
            items={attachments}
            sectionType={UPLOAD_TYPE.ATTACHMENT}
            onDelete={this.handleDelete}
          />
        </div>
        <MediaManager
          disableBackdropClick
          error={!!requestError}
          onClose={this.handleMediaManagerClose}
          onSubmit={this.handleMediaManagerSubmit}
          open={mediaManager}
          title="Dodaj multimedia"
        />
        <AlertDialog
          onCancel={this.handleAlertDialogCancel}
          {...alertDialog}
        />
      </React.Fragment>
    );
  }
}

SightEventMultimediaForm.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  clearError: PropTypes.func.isRequired,
  createImage: PropTypes.func.isRequired,
  createImageCancel: PropTypes.func.isRequired,
  createMainImage: PropTypes.func.isRequired,
  createMainImageCancel: PropTypes.func.isRequired,
  createPDF: PropTypes.func.isRequired,
  createPDFCancel: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})),
  defaultTranslation: PropTypes.string,
  deleteImage: PropTypes.func.isRequired,
  deletePDF: PropTypes.func.isRequired,
  itemId: PropTypes.number.isRequired,
  onFailure: PropTypes.func,
  onSuccess: PropTypes.func,
  translation: PropTypes.string,
  requestError: PropTypes.shape({
    message: PropTypes.string,
  }),
};

SightEventMultimediaForm.defaultProps = {
  data: [],
  defaultTranslation: DEFAULT_LANGUAGE,
  onFailure: null,
  onSuccess: null,
  translation: DEFAULT_LANGUAGE,
  requestError: null,
};

const mapStateToProps = state => ({
  requestError: sightEventsSelectors.getError(state),
});

const mapDispatchToProps = {
  clearError: sightEventsActions.clearError,
  createImage: sightEventsActions.createImage,
  createImageCancel: sightEventsActions.createImageCancel,
  createMainImage: sightEventsActions.createMainImage,
  createMainImageCancel: sightEventsActions.createMainImageCancel,
  createPDF: sightEventsActions.createPDF,
  createPDFCancel: sightEventsActions.createPDFCancel,
  deleteImage: sightEventsActions.deleteImage,
  deletePDF: sightEventsActions.deletePDF,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(SightEventMultimediaForm);
