import PartnersEdit from 'views/Market/Partners/PartnersEdit';

PartnersEdit.getInitialProps = ({ query }) => {
  const { itemId, successMessage, tab } = query;

  return {
    itemId: +itemId,
    successMessage: successMessage || null,
    tab: tab || null,
  };
};

export default PartnersEdit;
