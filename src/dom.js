var Dom = (function(Type, document) {

  "use strict";

  var Dom = function(selector, scope) {
    if(this instanceof Dom) {
      return this.find(selector, scope);
    }
    else {
      return new Dom(selector, scope);
    }
  };
  Dom.prototype = {
    // Implementation
    // ----------------

    // temporary nid, used for scoping
    _tempNid: 'Dom'+ -(new Date()),
    // Run selector for each element in scope
    _find: function(selector, scope) {
      if(!Type.is('String', selector)) { return this; }
      var i, nodeList, j, results = [];
      scope = Type.is('Array', scope) ? scope : [scope];
      scope = this._onlyElements(scope);

      // search
      for(i = 0; i < scope.length; i++) {
        nodeList = this._qsa(selector, scope[i]);
        for(j = nodeList.length; j--; results.unshift(nodeList[j]));
      }
      return results;
    },
    // Removes any non-elements from the set
    _onlyElements: function(set) {
      var i, elements = [];
      // ensure array
      set = Type.is('Array', set) ? set : [set];

      // filter elements
      for(i = 0; i < set.length; i++) {
        if(Type.is('Element', set[i])) { elements.push(set[i]); }
      }

      return elements;
    },
    // Find elements within optional scope using querySelectorAll
    _qsa: function(selector, scope) {
      var _scopeNid, results;
      if(scope) {
        _scopeNid = scope.getAttribute("id");
        // ensure scope element has an id.
        if(!_scopeNid) { scope.setAttribute("id", this._tempNid); }
        // create scoped selector
        selector = '#' + (_scopeNid ? _scopeNid : this._tempNid) + ' ' + selector;
      }

      // execute query
      results = document.querySelectorAll(selector);

      // remove temp nid from scope
      if(scope && !_scopeNid) { scope.removeAttribute("id"); }

      return results;
    }
  };

  return Dom;

})(Type, document);