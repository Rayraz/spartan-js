var EventProps = (function(Type) {

	"use strict";

  var _bodyEl, _customHandlers;

	_bodyEl = document.body;

	_customHandlers = {
		pageX: function(event, pointers) {
			return this._pointerCoordinates(event, pointers, 'X');
		},
		pageY: function(event, pointers) {
			return this._pointerCoordinates(event, pointers, 'Y');
		},
		_pointerCoordinates: function(event, pointers, axis) {
			var i
				, properties = [];

			pointers = pointers || [0];
			if(Type.is('Array', pointers)) {
				for(i in pointers) {
					properties.push(this._pointerCoordinate(event, pointers[i], axis));
				}
				return properties;
			}
			else {
				return this._pointerCoordinate(event, pointers, axis);
			}
		},
		_pointerCoordinate: function(event, pointer, axis) {
			var eventType = event.eventName || event.type;

			if(eventType.match(/^touch/)) {
				return event.touches[pointer]['page' + axis];
			}
			else if(eventType.match(/^mouse/)) {
				if(event.pageX || event.pageY) {
					return event['page' + axis];
				}
				else {
					return event['client' + axis] + _bodyEl['scroll' + ((axis == 'X') ? 'Left' : 'Top')];
				}
			}
		}
	};

	// API
	// ---

	return {
		registerHandler: function(property, getter) {
			if(Type.is('Function', getter)) {
				_customHandlers[property] = getter;
			}
		},
		get: function(event, property /* args */) {
			var args;

			if(_customHandlers[property]) {
				args = Array.prototype.slice.call(arguments, 2);
				args.unshift(event);
				return _customHandlers[property].apply(_customHandlers, args);
			}
			else {
				return event[property];
			}
		}
	};

})(Type);