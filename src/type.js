/**
 * Type Checking
 */
var Type =(function() {

  "use strict";

  // Type Tests
  // ----------
  var _tests = {
    isElement: function(obj) {
      return !!(obj && obj.nodeType === 1);
    },
    isFinite: function(obj) {
      return isFinite(obj) && !isNaN(parseFloat(obj));
    },
    isNaN: function(obj) {
      return isNumber(obj) && obj != +obj;
    },
    isBoolean: function(obj) {
      return obj === true || obj === false || Object.prototype.toString.call(obj) == '[object Boolean]';
    },
    isNull: function(obj) {
      return obj === null;
    },
    isUndefined: function(obj) {
      return obj === void 0;
    },
  };

  _tests.isArray = Array.isArray || function(obj) {
    return Object.prototype.toString.call(obj) == '[object Array]';
  };

  if(Object.prototype.toString.call(arguments) != '[object Arguments]') {
    _tests.isArguments = function(obj) {
      return !!(obj && obj.hasOwnProperty('callee'));
    };
  }

  if(typeof (/./) !== 'function') {
    _tests.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  _tests.isEmpty = function(obj) {
    if(obj == null) { return true; }
    if(_.isArray(obj) || _.isString(obj)) { return obj.length === 0; }
    for(var key in obj) if(_.has(obj, key)) { return false; }
    return true;
  };

  // API
  return {
    is: function(type, value) {
      if(_tests.hasOwnProperty('is' + type)) {
        return _tests['is' + type](value);
      }
      else {
        return Object.prototype.toString.call(value) == '[object ' + type + ']';
      }
    }
  };

})();