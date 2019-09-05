import CategoriesCreate from 'views/Market/Categories/CategoriesCreate';

CategoriesCreate.getInitialProps = ({ query }) => {
  const { categoryId } = query;

  return { categoryId: +categoryId };
};

export default CategoriesCreate;
