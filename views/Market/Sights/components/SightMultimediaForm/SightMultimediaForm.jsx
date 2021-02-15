import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  actions as sightsActions,
} from '@hello-poland/commons/redux/sights';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import MultimediaForm from 'components/Multimedia/MultimediaForm';
import { actions as filesActions } from '@hello-poland/commons/redux/files';

function SightMultimediaForm(props) {
  const {
    clearError, createFile, createFileCancel, deleteFile, MainImageProps,
    ImageGalleryProps, defaultTranslation, itemId, onFailure, onSuccess, translation,
    partnerId,
  } = props;

  return (
    <MultimediaForm
      defaultTranslation={defaultTranslation}
      ImageGalleryProps={{ ...ImageGalleryProps }}
      itemId={itemId}
      createFile={createFile}
      createFileCancel={createFileCancel}
      deleteFile={deleteFile}
      MainImageProps={{ ...MainImageProps }}
      onFailure={onFailure}
      partnerId={partnerId}
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

SightMultimediaForm.propTypes = {
  clearError: PropTypes.func.isRequired,
  createFile: PropTypes.func.isRequired,
  createFileCancel: PropTypes.func.isRequired,
  deleteFile: PropTypes.func.isRequired,
  defaultTranslation: PropTypes.string,
  itemId: PropTypes.number.isRequired,
  ImageGalleryProps: PropTypes.shape({
    item: PropTypes.shape({}),
  }),
  MainImageProps: PropTypes.shape({
    item: PropTypes.shape({}),
  }),
  onFailure: PropTypes.func,
  onSuccess: PropTypes.func,
  partnerId: PropTypes.number,
  translation: PropTypes.string,
};

SightMultimediaForm.defaultProps = {
  defaultTranslation: DEFAULT_LANGUAGE,
  ImageGalleryProps: null,
  MainImageProps: null,
  onFailure: null,
  onSuccess: null,
  translation: DEFAULT_LANGUAGE,
};

const mapDispatchToProps = {
  clearError: sightsActions.clearError,
  createFile: filesActions.createFile,
  createFileCancel: filesActions.createFileCancel,
  deleteFile: filesActions.deleteFile,
  partnerId: null,
};

export default connect(null, mapDispatchToProps)(SightMultimediaForm);
