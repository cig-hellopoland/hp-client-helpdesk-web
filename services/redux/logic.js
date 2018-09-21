import { logic as viewLogic } from 'redux/view';
import { logic as moviesLogic } from 'redux/movies';

export default [
  ...viewLogic,
  ...moviesLogic,
];
