import React from 'react';
import SightEdit from 'views/Market/Sights/SightEdit';

const SightCreatePage = props => <SightEdit {...props} />;

SightCreatePage.getInitialProps = ({ query }) => ({
  itemId: null,
  partnerId: +query.partnerId || null,
  returnTo: query.returnTo || null,
});

export default SightCreatePage;
