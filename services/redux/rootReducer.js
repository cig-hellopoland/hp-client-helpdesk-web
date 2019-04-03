import { combineReducers } from 'redux';
import profile, { name as profileName } from 'redux/profile';
import partners, { name as partnersName } from 'redux/partners';

export default combineReducers({
  [profileName]: profile(),
  [partnersName]: partners(),
});
