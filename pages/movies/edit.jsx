import MovieEditView from 'views/MovieEditView';
import {
  actions as moviesActions,
  selectors as moviesSelectors,
} from 'redux/movies';

MovieEditView.getInitialProps = ({ store, query }) => {
  const movieData = moviesSelectors.getMovie(store.getState(), query.id);

  if (!movieData) {
    store.dispatch(moviesActions.fetchMovies());
  }

  return {
    movie: movieData || {},
    id: query.id,
  };
};

export default MovieEditView;
