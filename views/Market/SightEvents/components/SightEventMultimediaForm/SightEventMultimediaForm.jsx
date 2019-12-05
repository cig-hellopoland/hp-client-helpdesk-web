import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  actions as sightEventsActions,
  selectors as sightEventsSelectors,
} from '@hello-poland/commons/redux/sightEvents';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import MultimediaForm from 'components/Multimedia/MultimediaForm';

function SightEventMultimediaForm(props) {
  const {
    clearError, createImage, createImageCancel, createMainImage, createMainImageCancel, createPDF,
    createPDFCancel, data, defaultTranslation, deleteImage, deletePDF, itemId, onFailure, onSuccess,
    requestError, translation,
  } = props;

  return (
    <MultimediaForm
      AttachmentProps={{
        createAttachment: createPDF,
        createAttachmentCancel: createPDFCancel,
        deleteAttachment: deletePDF,
        items: data.attachments,
      }}
      defaultTranslation={defaultTranslation}
      error={!!requestError}
      ImageGalleryProps={{
        createImage,
        createImageCancel,
        deleteImage,
        items: data.images,
      }}
      itemId={itemId}
      MainImageProps={{
        createMainImage,
        createMainImageCancel,
        item: data.mainImage,
      }}
      onFailure={onFailure}
      onSuccess={() => {
        clearError();

        if (onSuccess) {
          onSuccess();
        }
      }}
      translation={translation}
    />
  );
}

SightEventMultimediaForm.propTypes = {
  clearError: PropTypes.func.isRequired,
  createImage: PropTypes.func.isRequired,
  createImageCancel: PropTypes.func.isRequired,
  createMainImage: PropTypes.func.isRequired,
  createMainImageCancel: PropTypes.func.isRequired,
  createPDF: PropTypes.func.isRequired,
  createPDFCancel: PropTypes.func.isRequired,
  data: PropTypes.shape({
    attachments: PropTypes.arrayOf(PropTypes.shape({})),
    images: PropTypes.arrayOf(PropTypes.shape({})),
    mainImage: PropTypes.shape({}),
  }),
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

export default connect(mapStateToProps, mapDispatchToProps)(SightEventMultimediaForm);
