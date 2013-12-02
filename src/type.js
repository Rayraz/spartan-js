// Type Checking
SpartanJS.register('Type', function() {

	"use strict";

	// Type Tests
	// ----------

	var _tests = {
		wildcard: function(obj, type) {
			return Object.prototype.toString.call(obj) == '[object ' + type + ']';
		},
		isElement: function(obj) {
			return !!(obj && obj.nodeType === 1);
		},
		isFinite: function(obj) {
			return isFinite(obj) && !isNaN(parseFloat(obj));
		},
		isNaN: function(obj) {
			return _tests.wildcard(obj, 'Number') && obj != +obj;
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
			return _tests.isObject(obj) && "setInterval" in obj && obj.self == obj;
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
		if(obj === null) {
			return true;
		}
		if(_tests.isArray(obj) || _tests.isString(obj)) {
			return obj.length === 0;
		}
		for(var key in obj) {
			if(obj.hasOwnProperty(key)) {
				return false;
			}
		}
		return true;
	};

	// API
	// ---

	return {
		is: function(types, value) {
			var i, n
				, type
				, test;

			types = _tests.isArray(types) ? types : [types];
			for(i = 0, n = types.length; i < n; i++) {
				type = types[i];
				test = _tests.hasOwnProperty('is' + type) ? _tests['is' + type] : _tests.wildcard;
				if(test.call(_tests, value, type)) {
					return true;
				}
			}
			return false;
		}
	};

});