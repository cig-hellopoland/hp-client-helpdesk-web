import SightEventEdit from 'views/Market/SightEvents/SightEventEdit';

SightEventEdit.getInitialProps = ({ query }) => ({
  itemId: null,
  partnerId: +query.partnerId || null,
  returnTo: query.returnTo || null,
  sightId: +query.sightId || null,
});

export default SightEventEdit;
