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
          else { e.cancelBubble = false; }
        }
      };
      this.stopImmediatePropagation = function() {
        this.isImmediatePropagationStopped = _returnTrue;
        this.stopPropagation();
      };
      this.target = this.target || this.srcElement;
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
    // Conditionally forward the event.
    var conditional = function(parent, selector, trigger, event) {
      var nodeList = new Dom(selector, parent).getAll();
      if(Array.prototype.indexOf.call(nodeList, event.target) > -1) {
        event = _fixEvent(event, this);
        this.events.trigger(trigger, event, event.target);
      }
    };

    // return partially applied function
    return function(event) {
      return conditional.call(this, parent, selector, trigger, event);
    };
  };

  /**
   * Forwards the event to event.targets' events handler.
   */
  var _eventForwarder = function(event) {
    event = _fixEvent(event, this);
    this.events.trigger(event.type, event, event.target);
  };

  /**
   * API
   */
  return {
    on: function(element, type, scope, listener) {
      var handler, trigger = type, firstOfType;
      if(arguments.length == 3) { listener = scope; scope = ''; }
      if(arguments.length == 4) { trigger += ' ' + scope; }

      // Make sure the element has an event handler
      if(!element.events || !(element.events instanceof Event)) {
        element.events = new Event();
      }
      handler     = element.events;
      firstOfType = !handler.hasListeners(trigger);

      // Bind listener to event handler
      handler.on(trigger, listener);

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
    },
    off: function(element, type, scope, listener) {
      var handler = element.events, trigger = type;
      if(arguments.length == 3) { listener = scope; scope = ''; }
      if(arguments.length == 4) { trigger += ' ' + scope; }

      // Unbind with Event
      if(handler) { handler.off(trigger, listener); }

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
  };

})(Type, Event, Dom);