import SightEventEdit from 'views/Market/SightEvents/SightEventEdit';

SightEventEdit.getInitialProps = ({ query }) => {
  const { itemId } = query;

  return { itemId: +itemId };
};

export default SightEventEdit;
