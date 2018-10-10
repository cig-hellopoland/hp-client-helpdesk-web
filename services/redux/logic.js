import parseReduxLogic from 'utils/parseReduxLogic';
import { logic as moviesLogic } from 'redux/movies';

export default parseReduxLogic({
  moviesLogic,
});
