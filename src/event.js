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
			var i, n
				, listeners = []
				, listener;

			// Listeners for event, listeners for wildcard
			listeners = listeners.concat(this._listeners[type], this._listeners['*']);

			// No listeners
			if(!listeners.length) {
				return;
			}

			// Trigger callbacks
			for(i = 0, n = listeners.length; i < n; i++) {
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
			var i, n, j, o
				, type
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

				for(i = 0, n = listeners.length; i < n; i++) {
					match    = false;
					listener = listeners[i];
					listener = Type.is('Array', listener) ? listener : [listener, context];

					if(!Type.is('Function', listener[0])) {
						throw Error('Event listener must be a function');
					}

					// Already registered?
					for(j = 0, o = registered.length; j < o; i++) {
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
			if(types == 'mousemove' || types == 'mouseup') {
				console.log(types, listeners, context);
			}
			var i, n, j, o
				, type
				, registered
				, listener
				, filtered = [];

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
				if(!registered || !registered.length) {
					return;
				}

				// Remove specific listeners
				listeners = Type.is('Array', listeners) ? listeners : [listeners];
				for(i = 0, n = listeners.length; i < n; i++) {
					listener = listeners[i];
					listener = Type.is('Array', listener) ? listener : [listener, context];
					for(j = 0, o = registered.length; j < o; j++) {
						if(registered[j][0] != listener[0]
							&& registered[j][1] != listener[1]) {
							filtered.push(registered[j]);
						}
					}
				}
				this._listeners[type] = filtered;
			}
		},
		hasListeners: function(type) {
			var i, n
				, listeners
				, numListeners = 0;

			if(type !== undefined) {
				listeners = this._listeners[type];
				return listeners ? !!listeners.length : false;
			}
			else {
				for(i = 0, n = listeners.length; n && i < n; i++) {
					numListeners += listeners[i].length;
				}
			}
			return !!numListeners;
		}
	};

	return Event;

});