import PartnersEdit from 'views/Market/Partners/PartnersEdit';

PartnersEdit.getInitialProps = ({ query }) => {
  const { itemId } = query;

  return { itemId: +itemId };
};

export default PartnersEdit;
