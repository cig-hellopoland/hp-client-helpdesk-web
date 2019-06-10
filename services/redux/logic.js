import parseReduxLogic from 'utils/parseReduxLogic';
import { logic as bookingLogic } from '@hello-poland/commons/redux/bookings';
import { logic as profileLogic } from 'redux/profile';
import { logic as partnersLogic } from 'redux/partners';
import { logic as sightEventsLogic } from '@hello-poland/commons/redux/sightEvents';
import { logic as usersLogic } from 'redux/users';


export default parseReduxLogic({
  bookingLogic,
  profileLogic,
  partnersLogic,
  sightEventsLogic,
  usersLogic,
});
