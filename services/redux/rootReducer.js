import { combineReducers } from 'redux';
import bookings, { name as bookingsName } from '@hello-poland/commons/redux/bookings';
import profile, { name as profileName } from 'redux/profile';
import sightEvents, { name as sightEventsName } from '@hello-poland/commons/redux/sightEvents';

export default combineReducers({
  [bookingsName]: bookings(),
  [profileName]: profile(),
  [sightEventsName]: sightEvents(),
});
