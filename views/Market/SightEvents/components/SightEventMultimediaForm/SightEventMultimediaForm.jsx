import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _uniq from 'lodash/uniq';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import {
  actions as sightEventsActions,
  selectors as sightEventsSelectors,
} from '@hello-poland/commons/redux/sightEvents';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import AlertDialog from 'components/AlertDialog';
import MediaManager from 'components/MediaManager';

const sectionTitle = {
  'application/pdf': 'Pliki',
  'image/jpeg': 'Obrazy',
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
  thumbnail: {
    width: 200,
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

    if (fileType === FILE_TYPES.MAIN_IMAGE) {
      action = createMainImageCancel;
    } else if (fileType === FILE_TYPES.DOCUMENT) {
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
    const dataTypes = _uniq(data.map(({ type }) => type));
    const isDefaultTranslation = defaultTranslation === translation;

    return (
      <React.Fragment>
        {(!data || data.length === 0)
          && (
            <Grid container item direction="column" alignItems="center" justify="center">
              <FolderOpenIcon className={classes.image} />
              <Typography variant="h6">Multimedia</Typography>
              <Typography>Brak plików przypisanych do oferty.</Typography>
              <Button className={classes.fetchButton} variant="outlined" onClick={() => this.handleUploadModalOpen(itemId, dataTypes[0])}>
                Dodaj
              </Button>
            </Grid>
          )
        }
        {(data && data.length > 0) && dataTypes.map(fileType => (
          <div key={fileType} className={classes.section}>
            <Grid container alignItems="center" justify="space-between">
              <Grid item>
                <Typography variant="h6">{sectionTitle[fileType]}</Typography>
              </Grid>
              <Grid item>
                <IconButton
                  aria-label="Dodaj"
                  disabled={!isDefaultTranslation}
                  onClick={() => this.handleUploadModalOpen(itemId, fileType)}
                  title="Dodaj"
                >
                  <AddIcon />
                </IconButton>
              </Grid>
            </Grid>
            <Table>
              <TableBody>
                {data.map(({
                  downloadUrl, id: fileId, name, type,
                }) => fileType === type
                  && (
                    <TableRow key={`${name}-${fileId}`} hover>
                      <TableCell className={classes.thumbnail} padding={type === 'image/jpeg' ? 'none' : 'default'}>
                        {type === 'image/jpeg'
                          ? <img src={downloadUrl.qvgWebp} width={160} alt={name} />
                          : <InsertDriveFileIcon />
                        }
                      </TableCell>
                      <TableCell>{name}</TableCell>
                      <TableCell align="right">
                        {type !== 'image/jpeg'
                          && (
                            <IconButton
                              component="a"
                              href={downloadUrl}
                              aria-label="Pobierz"
                              title="Pobierz"
                              target="_blank"
                            >
                              <GetAppIcon />
                            </IconButton>
                          )
                        }
                        <IconButton
                          aria-label="Usuń"
                          disabled={type === 'image/jpeg'}
                          onClick={() => this.handleDelete(fileId, { name, type })}
                          title="Usuń"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <MediaManager
              disableBackdropClick
              error={requestError}
              onClose={this.handleMediaManagerClose}
              onSubmit={this.handleMediaManagerSubmit}
              open={mediaManager}
              title="Dodaj multimedia"
            />

            <AlertDialog
              onCancel={this.handleAlertDialogCancel}
              {...alertDialog}
            />
          </div>
        ))}
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
  requestError: sightEventsSelectors.getError(state),
});

const mapDispatchToProps = {
  clearError: sightEventsActions.clearError,
  createMainImage: sightEventsActions.createMainImage,
  createMainImageCancel: sightEventsActions.createMainImageCancel,
  createPDF: sightEventsActions.createPDF,
  createPDFCancel: sightEventsActions.createPDFCancel,
  deletePDF: sightEventsActions.deletePDF,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(SightEventMultimediaForm);
