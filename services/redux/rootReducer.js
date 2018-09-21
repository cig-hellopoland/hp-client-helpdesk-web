import { combineReducers } from 'redux';
import view, { name as viewName } from 'redux/view';
import counter, { name as counterName } from 'views/HomeView/redux/counter';
import movies, { name as moviesName } from 'redux/movies';

export default combineReducers({
  [counterName]: counter,
  [moviesName]: movies,
  [viewName]: view,
});
