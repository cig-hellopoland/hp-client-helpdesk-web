import parseReduxLogic from 'utils/parseReduxLogic';
import { logic as profileLogic } from 'redux/profile';
import { logic as sightEventsLogic } from '@hello-poland/commons/redux/sightEvents';
import { logic as partnersLogic } from 'redux/partners';


export default parseReduxLogic({
  profileLogic,
  sightEventsLogic,
  partnersLogic,
});
