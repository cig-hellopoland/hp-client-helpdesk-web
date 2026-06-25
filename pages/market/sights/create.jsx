import SightEdit from 'views/Market/Sights/SightEdit';

SightEdit.getInitialProps = ({ query }) => ({
  itemId: null,
  partnerId: +query.partnerId || null,
  returnTo: query.returnTo || null,
});

export default SightEdit;
