import SightEdit from 'views/Market/Sights/SightEdit';

SightEdit.getInitialProps = ({ query }) => {
  const {
    itemId, partnerId, successMessage, tab,
  } = query;

  return {
    itemId: +itemId || null,
    partnerId: +partnerId || null,
    successMessage: successMessage || null,
    tab: tab || null,
  };
};

export default SightEdit;
