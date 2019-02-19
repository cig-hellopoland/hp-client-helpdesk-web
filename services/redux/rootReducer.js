import { combineReducers } from 'redux';
import profile, { name as profileName } from 'redux/profile';

export default combineReducers({
  [profileName]: profile(),
});
