import parseReduxLogic from 'utils/parseReduxLogic';
import { logic as bookingLogic } from '@hello-poland/commons/redux/bookings';
import { logic as categoriesLogic } from '@hello-poland/commons/redux/categories';
import { logic as categoriesOrderLogic } from 'redux/categoriesOrder';
import { logic as filesLogic } from '@hello-poland/commons/redux/files';
import { logic as partnersLogic } from 'redux/partners';
import { logic as profileLogic } from 'redux/profile';
import { logic as sightCreationLogic } from 'redux/sightCreation';
import { logic as sightEventCreationLogic } from 'redux/sightEventCreation';
import { logic as sightEventsLogic } from '@hello-poland/commons/redux/sightEvents';
import { logic as sightsLogic } from '@hello-poland/commons/redux/sights';
import { logic as tagsLogic } from '@hello-poland/commons/redux/tags';
import { logic as ticketDefinitionsLogic } from 'redux/ticketDefinitions';
import { logic as ticketPoolDefinitionsLogic } from '@hello-poland/commons/redux/ticketPoolDefinitions';
import { logic as ticketTypesLogic } from 'redux/ticketTypes';
import { logic as usersLogic } from 'redux/users';

export default parseReduxLogic({
  bookingLogic,
  categoriesLogic,
  categoriesOrderLogic,
  filesLogic,
  partnersLogic,
  profileLogic,
  sightCreationLogic,
  sightEventCreationLogic,
  sightEventsLogic,
  sightsLogic,
  tagsLogic,
  ticketDefinitionsLogic,
  ticketPoolDefinitionsLogic,
  ticketTypesLogic,
  usersLogic,
});
