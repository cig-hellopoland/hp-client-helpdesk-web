import parseReduxLogic from 'utils/parseReduxLogic';
import { logic as bookingLogic } from '@hello-poland/commons/redux/bookings';
import { logic as categoriesLogic } from '@hello-poland/commons/redux/categories';
import { logic as partnersLogic } from 'redux/partners';
import { logic as profileLogic } from 'redux/profile';
import { logic as sightEventsLogic } from '@hello-poland/commons/redux/sightEvents';
import { logic as tagsLogic } from '@hello-poland/commons/redux/tags';
import { logic as ticketDefinitions } from '@hello-poland/commons/redux/ticketDefinitions';


export default parseReduxLogic({
  bookingLogic,
  categoriesLogic,
  partnersLogic,
  profileLogic,
  sightEventsLogic,
  tagsLogic,
  ticketDefinitions,
});
