var Event = (function(Type) {

  "use strict";

  var slice = Array.prototype.slice;

  /**
   * Implementation of Array.indexOf which sadly is not available in IE<=8
   */
  var indexOf = Array.prototype.indexOf || function(item) {
    var i, len = this.length;
    for(i = 0; i < len; i += 1) {
      if(this[i] === item) {
        return i;
      }
    }
    return -1;
  };

  // Super Simple Event Handling
  // ---------------------------
  var Event = function() {
    if(!(this instanceof Event)) {
      return new Event();
    }
    else { this._listeners = {}; }
  };

  Event.prototype = {
    trigger: function(type, event /* polymorphic */) {
      var listeners = [], i, listener;

      // listeners for event, listeners for wildcard
      listeners = listeners.concat(this._listeners[type], this._listeners['*']);

      // no listeners
      if(!listeners.length) { return; }

      // trigger callbacks
      for(i = 0; i < listeners.length; i++) {
        // allow interrupting the callback loop.
        if(event && event.isImmediatePropagationStopped && event.isImmediatePropagationStopped()) { break; }

        // dont interrupt the callback loop on errors
        try { listeners[i].apply(undefined, slice.call(arguments, 1)); }
        catch(exception) { continue; }
      }

      return this;
    },
    on: function(type, listener) {
      var listeners = this._listeners[type] || undefined;

      // ensure type is registered
      listeners = Type.is('Array', listeners) ? listeners : [];

      // ignore duplicate listeners
      if(indexOf.call(listeners, listener) >= 0) { return; }

      // register new listener
      listeners.push(listener);

      // store result
      this._listeners[type] = listeners;

      return this;
    },
    off: function(type, listener) {
      var listeners, index;

      // No type defined: Remove listeners for all types
      if(type === undefined) {
        this._listeners = {};
      }

      // No listeners defined: Remove all listeners for type
      if(listener === undefined) {
        delete this._listeners[type];
      }

      // Remove specific listener
      listeners = this._listeners[type];
      index     = indexOf.call(listeners, listener);
      if(index !== -1) {
        listeners.splice(index, 1);
        this._listeners[type] = listeners;
      }

      return this;
    },
    hasListeners: function(type) {
      var listeners, i, numListeners = 0;
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

})(Type);