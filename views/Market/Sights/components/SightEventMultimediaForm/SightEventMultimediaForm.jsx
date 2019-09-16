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
} from '@hello-poland/commons/redux/sightEvents';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import AlertDialog from 'components/AlertDialog';
import MediaManager from 'components/MediaManager';
import MultimediaSection from './Section';

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

    if (type !== 'image/jpeg') {
      alertDialog.onSuccess = () => {
        this.handleDeletePDF(fileId);
        this.handleAlertDialogCancel();
      };
    }

    this.setState({ alertDialog });
  };

  handleDeletePDF = () => {
    const { deletePDF, itemId } = this.props;
    const { language } = this.state;

    const payload = {
      id: itemId,
      onSuccess: () => this.handleFetchItem(itemId, language),
    };

    deletePDF(payload);
  };

  handleMediaManagerClose = () => {
    const { clearError, createMainImageCancel, createPDFCancel } = this.props;
    const { mediaManagerData } = this.state;
    const { fileType } = mediaManagerData;
    let action = () => {};

    this.setState({
      mediaManager: false,
      mediaManagerData: {},
    });

    if (fileType === 'image/jpeg') {
      action = createMainImageCancel;
    } else if (fileType === 'application/pdf') {
      action = createPDFCancel;
    }

    action();
    clearError();
  };

  handleMediaManagerSubmitSuccess = () => this.handleMediaManagerClose();

  handleMediaManagerSubmit = ({ data, options }) => {
    const { createMainImage, createPDF } = this.props;
    const { mediaManagerData } = this.state;
    const { fileType, itemId } = mediaManagerData;
    let action = () => {};

    if (fileType === 'image/jpeg') {
      action = createMainImage;
    } else if (fileType === 'application/pdf') {
      action = createPDF;
    }

    action({
      id: itemId,
      data,
      options,
      onSuccess: this.handleMediaManagerSubmitSuccess,
    });
  };

  handleUploadModalOpen = (itemId, fileType) => this.setState({
    mediaManager: true,
    mediaManagerData: {
      itemId,
      fileType,
    },
  });

  render() {
    const { alertDialog, mediaManager } = this.state;
    const {
      classes, data, defaultTranslation, itemId, requestError, translation,
    } = this.props;
    const isDefaultTranslation = defaultTranslation === translation;
    const images = (data && data.filter(item => item.type === 'image/jpeg')) || [];
    const documents = (data && data.filter(item => item.type === 'application/pdf')) || [];

    return (
      <React.Fragment>
        <div className={classes.section}>
          <Grid container alignItems="center" justify="space-between">
            <Grid item>
              <Typography variant="h6">Obrazy</Typography>
            </Grid>
            <Grid item>
              <IconButton
                aria-label="Dodaj"
                disabled={!isDefaultTranslation}
                onClick={() => this.handleUploadModalOpen(itemId, 'image/jpeg')}
                title="Dodaj"
              >
                <AddIcon />
              </IconButton>
            </Grid>
          </Grid>
          <MultimediaSection items={images} onDelete={this.handleDelete} />
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
                onClick={() => this.handleUploadModalOpen(itemId, 'application/pdf')}
                title="Dodaj"
              >
                <AddIcon />
              </IconButton>
            </Grid>
          </Grid>
          <MultimediaSection items={documents} onDelete={this.handleDelete} />
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
  createMainImage: PropTypes.func.isRequired,
  createMainImageCancel: PropTypes.func.isRequired,
  createPDF: PropTypes.func.isRequired,
  createPDFCancel: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})),
  defaultTranslation: PropTypes.string,
  deletePDF: PropTypes.func.isRequired,
  itemId: PropTypes.number.isRequired,
  translation: PropTypes.string,
  requestError: PropTypes.shape({
    message: PropTypes.string,
  }),
};

SightEventMultimediaForm.defaultProps = {
  data: [],
  defaultTranslation: DEFAULT_LANGUAGE,
  translation: DEFAULT_LANGUAGE,
  requestError: null,
};

const mapStateToProps = state => ({
  requestError: sightsSelectors.getError(state),
});

const mapDispatchToProps = {
  clearError: sightsActions.clearError,
  createMainImage: sightsActions.createMainImage,
  createMainImageCancel: sightsActions.createMainImageCancel,
  createPDF: sightsActions.createPDF,
  createPDFCancel: sightsActions.createPDFCancel,
  deletePDF: sightsActions.deletePDF,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(SightEventMultimediaForm);
