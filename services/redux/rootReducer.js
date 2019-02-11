import { combineReducers } from 'redux';
import counter, { name as counterName } from 'views/HomeView/redux/counter';
import movies, { name as moviesName } from 'redux/movies';
import profile, { name as profileName } from 'redux/profile';

export default combineReducers({
  [counterName]: counter,
  [moviesName]: movies,
  [profileName]: profile(),
});
