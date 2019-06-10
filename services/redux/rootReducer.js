import { combineReducers } from 'redux';
import bookings, { name as bookingsName } from '@hello-poland/commons/redux/bookings';
import profile, { name as profileName } from 'redux/profile';
import partners, { name as partnersName } from 'redux/partners';
import sightEvents, { name as sightEventsName } from '@hello-poland/commons/redux/sightEvents';
import users, { name as usersName } from 'redux/users';


export default combineReducers({
  [bookingsName]: bookings(),
  [profileName]: profile(),
  [partnersName]: partners(),
  [sightEventsName]: sightEvents(),
  [usersName]: users(),
});
