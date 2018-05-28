import { combineReducers } from 'redux';
import config, { name as configName } from '../../redux/config';
import view, { name as viewName } from '../../redux/view';
import counter, { name as counterName } from '../../views/HomeView/redux/counter';

export default combineReducers({
  [configName]: config,
  [counterName]: counter,
  [viewName]: view,
});
