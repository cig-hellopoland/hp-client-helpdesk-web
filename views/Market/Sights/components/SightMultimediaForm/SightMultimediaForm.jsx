import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  actions as sightsActions,
  selectors as sightsSelectors,
} from '@hello-poland/commons/redux/sights';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import MultimediaForm from 'components/Multimedia/MultimediaForm';

function SightMultimediaForm(props) {
  const {
    clearError, createImage, createImageCancel, createMainImage, createMainImageCancel,
    deleteImage, data, defaultTranslation, itemId, onFailure, onSuccess, requestError, translation,
  } = props;

  return (
    <MultimediaForm
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

SightMultimediaForm.propTypes = {
  clearError: PropTypes.func.isRequired,
  createImage: PropTypes.func.isRequired,
  createImageCancel: PropTypes.func.isRequired,
  createMainImage: PropTypes.func.isRequired,
  createMainImageCancel: PropTypes.func.isRequired,
  data: PropTypes.shape({
    attachments: PropTypes.arrayOf(PropTypes.shape({})),
    images: PropTypes.arrayOf(PropTypes.shape({})),
    mainImage: PropTypes.shape({}),
  }),
  defaultTranslation: PropTypes.string,
  deleteImage: PropTypes.func.isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(SightMultimediaForm);
