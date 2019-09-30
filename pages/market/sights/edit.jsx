import SightEdit from 'views/Market/Sights/SightEdit';

SightEdit.getInitialProps = ({ query }) => {
  const { itemId } = query;

  return { itemId: +itemId };
};

export default SightEdit;
