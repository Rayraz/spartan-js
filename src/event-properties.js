var EventProps = (function(Type) {

  "use strict";

  var _bodyEl = document.body;

  var _customHandlers = {
    pageX: function(event, pointers) {
      var i, properties = [];
      pointers = pointers || 0;
      if(Type.is('Array', pointers)) {
        for(i in pointers) {
          properties.push(this._pointerCoordinate(event, pointers[i], 'X'));
        }
        return properties;
      }
      else {
        return this._pointerCoordinate(event, pointers, 'X');
      }
    },
    pageY: function() {
      return this._pointerCoordinate(event, pointers, 'Y');
    },
    _pointerCoordinate: function(event, pointer, axis) {
      var eventType = event.eventName || event.type;
      if(eventType == 'touchstart') {
        return event.touches[touchNr]['page' + axis];
      }
      else if(eventType == 'mousedown') {
        if(event.pageX || event.pageY) {
          return event['page' + axis];
        }
        else {
          return event['client' + axis] + _bodyEl['scroll' + ((axis == 'X') ? 'Left' : 'Top')];
        }
      }
    }
  };

  /**
   * API
   */
  return {
    registerHandler: function(property, getter) {
      if(Type.is('Function', getter)) {
        _customHandlers[property] = getter;
      }
    },
    get: function(event, property /* args */) {
      return _customHandlers[property]
           ? _customHandlers[property].apply(_customHandlers, arguments)
           : event[property];
    }
  };

})(Type);