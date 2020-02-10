import TicketsEdit from 'views/Market/Tickets/TicketsEditView';

TicketsEdit.getInitialProps = ({ query }) => {
  const { itemId, partnerId } = query;

  return {
    itemId: +itemId || null,
    partnerId: +partnerId || null,
  };
};

export default TicketsEdit;
