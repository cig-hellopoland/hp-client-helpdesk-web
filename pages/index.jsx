import HomeView from 'views/HomeView';
import { selectors } from 'views/HomeView/redux/counter';

HomeView.getInitialProps = ({ store }) => {
  const state = store.getState();

  return {
    count: selectors.getCount(state),
  };
};

export default HomeView;
