import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { selectors as moviesSelectors } from 'redux/movies';
import Layout from 'components/Layout';

const MovieView = ({ movie }) => (
  <Layout>
    <Card>
      <CardHeader
        title={movie.title}
      />
      <CardMedia
        component="img"
        style={{ width: 'auto' }}
        src={movie.poster}
        title="poster"
      />
      <CardContent>
        <Typography component="p">
          {movie.description}
        </Typography>
      </CardContent>
    </Card>
  </Layout>
);

MovieView.propTypes = {
  movie: PropTypes.shape({}),
};

MovieView.defaultProps = {
  movie: {},
};

const mapStateToProps = (state, { id }) => ({
  movie: moviesSelectors.getMovie(state, id),
});

export default connect(mapStateToProps)(MovieView);
