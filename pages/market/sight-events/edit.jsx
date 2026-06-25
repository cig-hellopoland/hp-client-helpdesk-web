import SightEventEdit from 'views/Market/SightEvents/SightEventEdit';

SightEventEdit.getInitialProps = ({ query }) => {
  const { itemId, partnerId, sightId } = query;

  return {
    itemId: +itemId || null,
    partnerId: +partnerId || null,
    sightId: +sightId || null,
  };
};

export default SightEventEdit;
