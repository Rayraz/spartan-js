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
    isObject: function(obj) {
      return obj && typeof obj === "object";
    },
    isWindow: function(obj) {
      return this.isObject(obj) && "setInterval" in obj && obj.self === obj;
    },
    wildcard: function(obj, type) {
      return Object.prototype.toString.call(obj) == '[object ' + type + ']';
    }
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
    if(_tests.isArray(obj) || _tests.isString(obj)) { return obj.length === 0; }
    for(var key in obj) if(obj.hasOwnProperty(key)) { return false; }
    return true;
  };

  // API
  return {
    is: function(types, value) {
      var i, type, test;
      types = _tests.isArray(types) ? types : [types];
      for(i in types) {
        type = types[i];
        test = _tests.hasOwnProperty('is' + type) ? _tests['is' + type] : _tests.wildcard;
        if(test.call(_tests, value, type)) { return true; }
      }
      return false;
    }
  };

})();