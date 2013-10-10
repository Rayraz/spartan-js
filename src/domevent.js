var DomEvent = (function(Type, Event, Dom) {

  "use strict";

  /**
   * Fix inconsistent/incomplete event implementations
   */
  var _fixEvent = function(event) {

    var _returnTrue = function() {
      return true;
    };
    var _returnFalse = function() {
      return false;
    };

    var EnhancedEvent = function() {
      this.originalEvent                 = event;
      this.isDefaultPrevented            = _returnFalse;
      this.isPropagationStopped          = _returnFalse;
      this.isImmediatePropagationStopped = _returnFalse;
      this.preventDefault = function() {
        this.isDefaultPrevented = _returnTrue;

        e = this.originalEvent;
        if(e) {
          if(e.preventDefault) { e.preventDefault(); }
          else { e.returnValue = false; }
        }
      };
      this.stopPropagation = function() {
        this.isPropagationStopped = _returnTrue;

        e = this.originalEvent;
        if(e) {
          if(e.stopPropagation) { e.stopPropagation(); }
          e.cancelBubble = true; // Chrome bug
        }
      };
      this.stopImmediatePropagation = function() {
        this.isImmediatePropagationStopped = _returnTrue;
        this.stopPropagation();
      };
      this.target = this.target || this.srcElement; // IE compat issue
      if(this.target.nodeType == 3) {
        this.target = this.target.parentNode; // Safari bug
      }
    };
    EnhancedEvent.prototype = event;

    return new EnhancedEvent();
  };

  /**
   * Returns a partially applied function that will:
   *
   * Forward the event to event.targets' events handler on the condition that
   * event.target is both a child of the parent node ánd matches the provided
   * selector.
   */
  var _delegateForwarder = function(parent, selector, trigger) {
    var isDelegate = function(candidate, selector, parent) {
      var delegates = Dom(selector, parent);
      return (Array.prototype.indexOf.call(delegates, event.target) > -1);
    };

    // return partially applied function
    return function(event) {
      event      = event || window.event;
      event      = _fixEvent(event, this);
      if(isDelegate(event.target, selector, parent)
        || isDelegate(event.target, selector+' *', parent)) {
        this.events.trigger(trigger, event);
      }
    };
  };

  /**
   * Forwards the event to event.targets' events handler.
   */
  var _eventForwarder = function(event) {
    event = event || window.event;
    event = _fixEvent(event, this);
    this.events.trigger(event.type, event);
  };

  /**
   * API
   */
  return {
    on: function(element, types, scope, listeners, context) {
      var i, trigger, type, handler, firstOfType;
      if(!Type.is(['Element', 'Window'], element)) { return; }
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
        else { trigger += '(' + scope + ')'; }

        // Make sure the element has an event handler
        if(!element.events || !(element.events instanceof Event)) {
          element.events = new Event();
        }
        handler     = element.events;
        firstOfType = !handler.hasListeners(trigger);

        // Bind listeners to event handler
        handler.on(trigger, listeners, context);

        // Create/Get a callback that will trigger the event handler
        handler[trigger] = (scope) ? _delegateForwarder(element, scope, trigger) : _eventForwarder;

        // Let native eventListener forward the dom event to the targets'
        // event handler.
        if(firstOfType) {
          if(element.addEventListener) {
            element.addEventListener(type, handler[trigger], false);
          }
          else {
            element.attachEvent(type, handler[trigger]);
          }
        }
      }
    },
    off: function(element, types, scope, listeners, context) {
      var i, trigger, type, handler = element.events;
      if(!Type.is('Element', element)) { return; }
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
        else { trigger += '(' + scope + ')'; }

        // Unbind with Event
        if(handler) { handler.off(trigger, listeners); }

        // If event has no more listeners, remove the Event.
        if(!handler.hasListeners(trigger)) {
          if(element.removeEventListener) {
            element.removeEventListener(type, handler[trigger], false);
          }
          else {
            element.detachEvent(type, handler[trigger]);
          }
          // the forwarder is of no use now either
          delete handler[trigger];
        }
      }
    }
  };

})(Type, Event, Dom);