var DomEvent = (function(Type, Event, Dom) {

	"use strict";

	var _fixEvent
		, _eventTags
		, _eventSupportCache
		, _isEventSupported
		, _getEventTarget
		, _triggerEventDOM
		, _triggerEventIE
		, _triggerEvent
		, _delegateForwarder
		, _eventForwarder;

	// Event Object Compatibility
	// --------------------------
	_fixEvent = function(event) {
		var _returnTrue
			, _returnFalse
			, EnhancedEvent
			, i;

		_returnTrue = function() {
			return true;
		};
		_returnFalse = function() {
			return false;
		};

		EnhancedEvent = function() {
			this.originalEvent                 = event;
			this.isDefaultPrevented            = _returnFalse;
			this.isPropagationStopped          = _returnFalse;
			this.isImmediatePropagationStopped = _returnFalse;

			this.preventDefault = function() {
				var event = this.originalEvent;
				this.isDefaultPrevented = _returnTrue;
				if(event) {
					if(event.preventDefault) {
						event.preventDefault();
					}
					else {
						event.returnValue = false;
					}
				}
			};
			this.stopPropagation = function() {
				var event = this.originalEvent;
				this.isPropagationStopped = _returnTrue;
				if(event) {
					if(event.stopPropagation) {
						event.stopPropagation();
					}
					event.cancelBubble = true; // Chrome bug
				}
			};
			this.stopImmediatePropagation = function() {
				this.isImmediatePropagationStopped = _returnTrue;
				this.stopPropagation();
			};

			// Firefox will not allow us to override event.target, so only set the
			// target if it's not already there.
			if(event.target === undefined) {
				this.target = event.srcElement; // IE compat issue
			}
			else if(event.target.nodeType == 3) {
				this.target = this.target.parentNode; // Safari bug
			}
			else {
				this.target = this.target;
			}

			// Check for custom eventName
			this.type = (event.eventName) ? event.eventName : event.type;
		};

		// Firefox complains because we don't imlement the full Event interface
		// so we have to clone the original event rather than extending it.
		for(i in event) {
			if(Type.is('Function', event[i])) {
				EnhancedEvent.prototype[i] = function() {
					var e = this.originalEvent;
					return e[i].apply(e, arguments);
				}
			}
			else {
				EnhancedEvent.prototype[i] = event[i];
			}
		}

		return new EnhancedEvent();
	};

	// Event Support
	// -------------

	_eventTags = {
		'select': 'input',
		'change': 'input',
		'submit': 'form',
		'reset':  'form',
		'error':  'img',
		'load':   'img',
		'abort':  'img'
	};
	_eventSupportCache = {};
	_isEventSupported  = function(type) {
		var element
			, isSupported;

		if(Type.is('Undefined', _eventSupportCache[type])) {
			type        = 'on' + type;
			isSupported = (type in window);
			if(!isSupported) {
				element     = document.createElement(_eventTags[type] || 'div');
				isSupported = (type in element);
			}
			if(!isSupported) {
				element.setAttribute(type, 'return;');
				isSupported = typeof element[type] == 'function';
			}
			element = null;
			_eventSupportCache[type] = isSupported;
		}
		return _eventSupportCache[type];
	};

	// Custom Events
	// -------------

	_getEventTarget = function(element) {
		if(element === document && document.createEvent && !element.dispatchEvent) {
			return document.documentElement;
		}
		else {
			return (element.nodeType === 3 || element.nodeType === 8) ? null : element;
		}
	};
	_triggerEventDOM = function(element, type, properties, bubble) {
		var event
			, property;

		event = document.createEvent('HTMLEvents');
		event.initEvent('dataavailable', bubble, true);

		for(property in properties) {
			event[property] = properties[property];
		}
		event.eventName = type;

		element.dispatchEvent(event);
		return event;
	};
	_triggerEventIE = function(element, type, properties, bubble) {
		var event
			, property;

		event           = document.createEventObject();
		event.eventType = bubble ? 'ondataavailable' : 'onlosecapture';

		for(property in properties) {
			event[property] = properties[property];
		}
		event.eventName = type;

		element.fireEvent(event.eventType, event);
		return event;
	};
	_triggerEvent = document.createEvent ? _triggerEventDOM : _triggerEventIE;

	// Event Forwarders
	// ----------------
	// Forwards DOM Events trough Event component that lists the actual
	// user-assigned callbacks.

	// Returns a partially applied function that will forward a delegated event
	// provided the event's target passes the following criteria:
	// - event.target is a child of the delegator node
	// - event.target matches the provided selector ór is a child of a node
	//   matching the selector.
	_delegateForwarder = function(delegator, selector, trigger) {
		var isDelegate = function(candidate, selector, delegator) {
			var i
				, delegates = Dom(selector, delegator);
			for(i in delegates) {
				if(delegates[i] === candidate) {
					return true;
				}
			}
			return false;
		};

		// return partially applied function
		return function(event) {
			event = event || window.event;
			event = _fixEvent(event, this);
			if(isDelegate(event.target, selector, delegator)
				|| isDelegate(event.target, selector + ' *', delegator)) {

				// @TODO: I suspect this is a monkey-patch rather than how this is
				// supposed to work.
				if(!event.cancelBubble) {
					this.events.trigger(event.type + '(' + selector + ')', event);
				}
			}
		};
	};

	// Forwards the event to event.targets' events handler.
	_eventForwarder = function(event) {
		event = event || window.event;
		event = _fixEvent(event, this);

		// @TODO: I suspect this is a monkey-patch rather than how this is supposed
		// to work.
		if(!event.cancelBubble) {
			this.events.trigger(event.type, event);
		}
	};

	// API
	// ---

	return {
		isSupported: function(type) {
			return _isEventSupported(type);
		},
		trigger: function(element, type, properties, bubble) {
			element    = _getEventTarget(element);
			properties = properties || {};
			bubble     = (bubble === undefined) ? true : bubble;
			if(element) {
				_triggerEvent(element, type, properties, bubble);
			}
		},
		on: function(element, types, scope, listeners, context) {
			if(element === document) {
				element = document.documentElement;
			}
			if(!Type.is(['Element', 'Window'], element)) {
				return;
			}
			var i
				, trigger
				, type
				, handler
				, firstOfType
				, eventSupported;

			types = Type.is('Array', types) ? types : types.split(/[ ,]+/);

			// Split multiple events
			if(types.length > 1) {
				for(i = types.length; i--; this.on.call(this, element, types[i], scope, listeners, context));
				return;
			}

			// Bind listeners
			else {
				trigger = type = types.pop();

				if(!Type.is('String', scope)) {
					context   = listeners;
					listeners = scope;
					scope     = undefined;
				}
				else {
					trigger += '(' + scope + ')';
				}

				// Make sure the element has an event handler
				if(!element.events || !(element.events instanceof Event)) {
					element.events = new Event();
				}
				handler     = element.events;
				firstOfType = !handler.hasListeners(trigger);

				// Bind listeners to event handler
				handler.on(trigger, listeners, context);

				// Create/Get a callback that will trigger the event handler
				handler[trigger] = (scope) ? _delegateForwarder(element, scope) : _eventForwarder;

				// Let native eventListener forward the dom event to the targets'
				// Event handler.
				if(firstOfType) {
					eventSupported = _isEventSupported(type);
					if(element.addEventListener) {

						// Native events
						if(eventSupported) {
							element.addEventListener(type, handler[trigger], false);
						}

						// Custom events
						element.addEventListener('dataavailable', handler[trigger], false);
					}
					else {

						// Native events
						if(eventSupported) {
							element.attachEvent('on' + type, handler[trigger]);
						}

						// Custom events
						element.attachEvent('ondataavailable', handler[trigger]); // bubbling events
						element.attachEvent('onlosecapture', handler[trigger]); // non-bubbling events
					}
				}
			}
		},
		off: function(element, types, scope, listeners, context) {
			if(element === document) {
				element = document.documentElement;
			}
			if(!Type.is(['Element', 'Window'], element)) {
				return;
			}
			var i
				, trigger
				, type
				, handler = element.events
				, eventSupported;

			types = Type.is('Array', types) ? types : types.split(/[ ,]+/);

			// Split multiple events
			if(types.length > 1) {
				for(i = types.length; i--; this.off.call(this, element, types[i], scope, listeners, context));
				return;
			}

			// Bind listeners
			else {
				trigger = type = types.pop();

				if(!Type.is('String', scope)) {
					context   = listeners;
					listeners = scope;
					scope     = undefined;
				}
				else {
					trigger += '(' + scope + ')';
				}

				// Unbind with Event
				if(handler) {
					handler.off(trigger, listeners, context);
				}

				// If event has no more listeners, remove the Event.
				if(handler && !handler.hasListeners(trigger)) {
					eventSupported = _isEventSupported(type);
					if(element.removeEventListener) {

						// Native events
						if(eventSupported) {
							element.removeEventListener(type, handler[trigger], false);
						}

						// Custom events
						element.removeEventListener(type, handler[trigger], false);
					}
					else {

						// Native events
						if(eventSupported) {
							element.detachEvent('on' + type, handler[trigger]);
						}

						// Custom events
						element.detachEvent('ondataavailable', handler[trigger]);
						element.detachEvent('onlosecapture', handler[trigger]);
					}

					// the forwarder is of no use now either
					delete handler[trigger];
				}
			}
		}
	};

})(Type, Event, Dom);