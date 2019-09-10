import { combineReducers } from 'redux';
import bookings, { name as bookingsName } from '@hello-poland/commons/redux/bookings';
import categories, { name as categoriesName } from 'redux/categories';
import partners, { name as partnersName } from 'redux/partners';
import profile, { name as profileName } from 'redux/profile';
import sightEvents, { name as sightEventsName } from '@hello-poland/commons/redux/sightEvents';
import ticketDefinitions, { name as ticketDefinitionsName } from '@hello-poland/commons/redux/ticketDefinitions';

export default combineReducers({
  [bookingsName]: bookings(),
  [categoriesName]: categories(),
  [partnersName]: partners(),
  [profileName]: profile(),
  [sightEventsName]: sightEvents(),
  [ticketDefinitionsName]: ticketDefinitions(),
});
