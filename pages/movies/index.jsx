import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import withRoot from '../../src/withRoot';
import withRedux from '../../services/redux/withRedux';
import {
  actions as moviesActions,
  selectors as moviesSelectors,
} from '../../redux/movies';
import MovieView from '../../views/MovieView';
import MoviesView from '../../views/MoviesView';

MovieView.getInitialProps = ({ store, query }) => {
  const movieData = moviesSelectors.getMovie(store.getState(), query.id);

  if (!movieData) {
    store.dispatch(moviesActions.fetchMovies());
  }

  return {
    movie: movieData || {},
    id: query.id,
  };
};


MoviesView.getInitialProps = (initialProps) => {
  initialProps.store.dispatch(moviesActions.fetchMovies());

  return {};
};


class MoviesIndexPage extends React.Component {
  static async getInitialProps(initialProps) {
    const { store, query } = initialProps;
    const { id } = query;

    if (id) {
      const movieData = moviesSelectors.getMovie(store.getState(), id);

      if (!movieData) {
        await store.dispatch(moviesActions.fetchMovies());
      }

      return {
        id,
        movie: movieData || {},
      };
    }

    await initialProps.store.dispatch(moviesActions.fetchMovies());

    return {};
  }

  render() {
    const { id, movies } = this.props;
    return id ? <MovieView /> : <MoviesView movies={movies} />;
  }
}

MoviesIndexPage.propTypes = {
  id: PropTypes.string,
  movies: PropTypes.arrayOf(PropTypes.shape({})),
};

MoviesIndexPage.defaultProps = {
  id: '',
  movies: [],
};

const mapStateToProps = state => ({
  movies: moviesSelectors.getMovies(state),
});


export default compose(
  withRedux(mapStateToProps),
  withRoot,
)(MoviesIndexPage);
