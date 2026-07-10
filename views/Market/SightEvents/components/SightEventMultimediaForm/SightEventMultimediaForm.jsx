import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  actions as sightEventsActions,
} from '@hello-poland/commons/redux/sightEvents';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import MultimediaForm from 'components/Multimedia/MultimediaForm';
import { actions as filesActions } from '@hello-poland/commons/redux/files';


// Maby not partner id. check it
function SightEventMultimediaForm(props) {
  const {
    clearError, defaultTranslation, itemId, onFailure, onSuccess, createFile, createFileCancel,
    deleteFile, translation, ImageGalleryProps, MainImageProps, AttachmentProps, partnerId,
  } = props;

  return (
    <MultimediaForm
      createFile={createFile}
      createFileCancel={createFileCancel}
      deleteFile={deleteFile}
      AttachmentProps={{ ...AttachmentProps }}
      ImageGalleryProps={{ ...ImageGalleryProps }}
      MainImageProps={{ ...MainImageProps }}
      defaultTranslation={defaultTranslation}
      itemId={itemId}
      partnerId={partnerId}
      onFailure={onFailure}
      onSuccess={(data) => {
        clearError();

        if (onSuccess) {
          onSuccess(data);
        }
      }}
      translation={translation}
    />
  );
}

SightEventMultimediaForm.propTypes = {
  AttachmentProps: PropTypes.shape({
    item: PropTypes.shape({}),
  }),
  clearError: PropTypes.func.isRequired,
  createFile: PropTypes.func.isRequired,
  createFileCancel: PropTypes.func.isRequired,
  deleteFile: PropTypes.func.isRequired,
  defaultTranslation: PropTypes.string,
  ImageGalleryProps: PropTypes.shape({
    item: PropTypes.shape({}),
  }),
  itemId: PropTypes.number,
  MainImageProps: PropTypes.shape({
    item: PropTypes.shape({}),
  }),
  onFailure: PropTypes.func,
  onSuccess: PropTypes.func,
  partnerId: PropTypes.number,
  translation: PropTypes.string,
};

SightEventMultimediaForm.defaultProps = {
  AttachmentProps: null,
  defaultTranslation: DEFAULT_LANGUAGE,
  ImageGalleryProps: null,
  itemId: null,
  MainImageProps: null,
  onFailure: null,
  onSuccess: null,
  partnerId: null,
  translation: DEFAULT_LANGUAGE,
};

const mapDispatchToProps = {
  clearError: sightEventsActions.clearError,
  createFile: filesActions.createFile,
  createFileCancel: filesActions.createFileCancel,
  deleteFile: filesActions.deleteFile,
};

export default connect(null, mapDispatchToProps)(SightEventMultimediaForm);
