import { combineReducers } from 'redux';
import profile, { name as profileName } from 'redux/profile';
import sightEvents, { name as sightEventsName } from '@hello-poland/commons/redux/sightEvents';

export default combineReducers({
  [profileName]: profile(),
  [sightEventsName]: sightEvents(),
});
