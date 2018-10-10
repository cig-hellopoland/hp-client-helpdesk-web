/**
 * Converts multiple redux logic objects into single array.
 *
 * @method
 * @param {Object} logicMap - object of multiple logic ducks
 * @return {Array}
 */
const parseReduxLogic = logicMap => Object.values(logicMap).reduce((acc, obj) => [
  ...acc, ...Object.values(obj),
], []);

export default parseReduxLogic;
