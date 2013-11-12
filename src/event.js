SpartanJS.register('Event', function(SpartanJS) {

	"use strict";

	var Type  = SpartanJS.require('Type')
		, slice = Array.prototype.slice
		, Event;

	// Super Simple Event Handling
	// ---------------------------

	Event = function() {
		if(!(this instanceof Event)) {
			return new Event();
		}
		else {
			this._listeners = {};
		}
	};

	Event.prototype = {
		trigger: function(type, event /* polymorphic */) {
			var listeners = []
				, i
				, listener;

			// Listeners for event, listeners for wildcard
			listeners = listeners.concat(this._listeners[type], this._listeners['*']);

			// No listeners
			if(!listeners.length) {
				return;
			}

			// Trigger callbacks
			for(i = 0; i < listeners.length; i++) {
				// Allow interrupting the callback loop.
				if(event && event.isImmediatePropagationStopped && event.isImmediatePropagationStopped()) {
					break;
				}

				// Don't interrupt the callback loop on errors
				if(listener = listeners[i]) {
					listener[0].apply(listener[1], slice.call(arguments, 1));
				}
			}
		},
		on: function(types, listeners, context) {
			var type
				, i
				, j
				, registered
				, match
				, listener;

			types = Type.is('Array', types) ? types : types.split(/[ ,]+/);

			// Split multiple events
			if(types.length > 1) {
				for(i = types.length; i--; this.on.call(this, types[i], listeners, context));
				return;
			}

			// Bind listeners
			else {
				type = types.pop();

				// Prepare listeners
				registered = this._listeners[type] || [];
				listeners  = Type.is('Array', listeners) ? listeners : [listeners];

				for(i in listeners) {
					match    = false;
					listener = listeners[i];
					listener = Type.is('Array', listener) ? listener : [listener, context];

					// Already registered?
					for(j in registered) {
						match = registered[j] === listener;
						break;
					}

					// Not already bound, register listener.
					if(!match) {
						registered.push(listener);
					}
				}
			}

			// Store result
			this._listeners[type] = registered;
		},
		off: function(types, listeners, context) {
			var type
				, i
				, registered
				, listener
				, index;

			// No types defined: Remove listeners for all types
			if(types === undefined) {
				this._listeners = {};
				return;
			}

			// Iterate over event types
			types = Type.is('Array', types) ? types : types.split(/[ ,]+/);
			if(types.length > 1) {
				for(i = types.length; i--; this.off.call(this, types[i], listeners, context));
				return;
			}

			// No listeners defined: Remove all listeners for type
			else if(listeners === undefined) {
				delete this._listeners[type];
			}

			// Unbind listeners
			else{
				type       = types.pop();
				registered = this._listeners[type];

				// No existing listeners, nothing to do
				if(registered === undefined) {
					return;
				}

				// Remove specific listeners
				listeners = Type.is('Array', listeners) ? listeners : [listeners];
				for(i in listeners) {
					listener = listeners[i];
					listener = Type.is('Array', listener) ? listener : [listener, context];
					for(index in registered) {
						if(registered[index][0] == listener[0] && registered[index][1] == listener[1]) {
							registered.splice(index, 1);
						}
					}
				}
				this._listeners[type] = registered;
			}
		},
		hasListeners: function(type) {
			var listeners
				, i
				, numListeners = 0;

			if(type !== undefined) {
				listeners = this._listeners[type];
				return listeners ? !!listeners.length : false;
			}
			else {
				for(i in listeners) {
					if(listeners.hasOwnProperty(i)) {
						numListeners += listeners[i].length;
					}
				}
			}
			return !!numListeners;
		}
	};

	return Event;

});