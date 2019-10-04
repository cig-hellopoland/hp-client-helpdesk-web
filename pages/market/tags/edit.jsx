import TagsEdit from 'views/Market/Tags/TagsEdit';

TagsEdit.getInitialProps = ({ query }) => {
  const { itemId } = query;

  return { itemId: +itemId || null };
};

export default TagsEdit;
