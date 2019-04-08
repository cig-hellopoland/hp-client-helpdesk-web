import parseReduxLogic from 'utils/parseReduxLogic';
import { logic as profileLogic } from 'redux/profile';
import { logic as sightEventsLogic } from '@hello-poland/commons/redux/sightEvents';


export default parseReduxLogic({
  profileLogic,
  sightEventsLogic,
});
