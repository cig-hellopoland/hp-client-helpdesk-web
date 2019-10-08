import CategoriesEdit from 'views/Market/Categories/CategoriesEdit';

CategoriesEdit.getInitialProps = ({ query }) => {
  const { itemId } = query;

  return { itemId: +itemId || null };
};

export default CategoriesEdit;
