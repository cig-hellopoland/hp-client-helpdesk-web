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
  actions as sightsActions,
  selectors as sightsSelectors,
} from '@hello-poland/commons/redux/sights';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import AlertDialog from 'components/AlertDialog';
import MediaManager from 'components/MediaManager';
import MultimediaSection from './Section';

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

class SightMultimediaForm extends React.Component {
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

    if (type === UPLOAD_TYPE.GALLERY) {
      alertDialog.onSuccess = () => {
        this.handleImageDelete(fileId);
        this.handleAlertDialogCancel();
      };
    }

    this.setState({ alertDialog });
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

  handleMediaManagerClose = () => {
    const { clearError, createMainImageCancel } = this.props;
    const { mediaManagerData } = this.state;
    const { fileType } = mediaManagerData;
    let action = () => {};

    this.setState({
      mediaManager: false,
      mediaManagerData: {},
    });

    if (fileType === 'image/jpeg') {
      action = createMainImageCancel;
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
    const { createMainImage, createImage } = this.props;
    const { mediaManagerData } = this.state;
    const { uploadType, itemId } = mediaManagerData;
    let action = () => {};

    if (uploadType === UPLOAD_TYPE.MAIN_IMAGE) {
      action = createMainImage;
    } else if (uploadType === UPLOAD_TYPE.GALLERY) {
      action = createImage;
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

SightMultimediaForm.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  clearError: PropTypes.func.isRequired,
  createImage: PropTypes.func.isRequired,
  createImageCancel: PropTypes.func.isRequired,
  createMainImage: PropTypes.func.isRequired,
  createMainImageCancel: PropTypes.func.isRequired,
  deleteImage: PropTypes.func.isRequired,
  data: PropTypes.shape({
    attachments: PropTypes.arrayOf(PropTypes.shape({})),
    images: PropTypes.arrayOf(PropTypes.shape({})),
    mainImage: PropTypes.shape({}),
  }),
  defaultTranslation: PropTypes.string,
  itemId: PropTypes.number.isRequired,
  onFailure: PropTypes.func,
  onSuccess: PropTypes.func,
  translation: PropTypes.string,
  requestError: PropTypes.shape({
    message: PropTypes.string,
  }),
};

SightMultimediaForm.defaultProps = {
  data: {},
  defaultTranslation: DEFAULT_LANGUAGE,
  onFailure: null,
  onSuccess: null,
  translation: DEFAULT_LANGUAGE,
  requestError: null,
};

const mapStateToProps = state => ({
  requestError: sightsSelectors.getError(state),
});

const mapDispatchToProps = {
  clearError: sightsActions.clearError,
  createImage: sightsActions.createImage,
  createImageCancel: sightsActions.createImageCancel,
  createMainImage: sightsActions.createMainImage,
  createMainImageCancel: sightsActions.createMainImageCancel,
  deleteImage: sightsActions.deleteImage,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(SightMultimediaForm);
