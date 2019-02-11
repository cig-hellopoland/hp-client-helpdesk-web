import parseReduxLogic from 'utils/parseReduxLogic';
import { logic as moviesLogic } from 'redux/movies';
import { logic as profileLogic } from 'redux/profile';

export default parseReduxLogic({
  moviesLogic,
  profileLogic,
});
