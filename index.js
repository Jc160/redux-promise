'use strict';


//External
const FluxStandardAction = require('flux-standard-action');


//Internal


////////////////////////////////////////////////////////////


/**
 * This function checks if a variable is a promise.
 * @param  {Variable}  varValue Value
 * @return {Boolean}     Is promise.
 */
function isPromise(varValue) {
  return varValue && typeof varValue.then === 'function';
}


/**
 * Promise Middleware
 * @param  {Object} _ref Store reference.
 * @return {Function}      Middleware
 */
function promiseMiddleware(_ref) {
  const fnDispatch = _ref.dispatch;

  return function (fnNext) {
    return function (objAction) {
      if (!FluxStandardAction.isFSA(objAction)) {
        return isPromise(objAction) ? objAction.then(fnDispatch) : fnNext(objAction);
      }


      if (isPromise(objAction.payload)) {
        return objAction.payload.then((objResult) => {
          const objSuccessAction = { ...objAction, payload: objResult };
          fnDispatch(objSuccessAction);
          return objSuccessAction;
        }).catch((objError) => {
          if (isPromise(objError)) {
            return objError.then((objError) => {
              const objErrorAction = { ...objAction, payload: objError, error: true };
              fnDispatch(objErrorAction);
              return Promise.reject(objErrorAction);
            });
          }


          const objErrorAction = { ...objAction, payload: objError, error: true };
          fnDispatch(objErrorAction);

          return Promise.reject(objErrorAction);
        });
      }


      return fnNext(objAction);
    };
  };
}


////////////////////////////////////////////////////////////


export default promiseMiddleware;
