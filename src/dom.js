SpartanJS.register('Dom', function(SpartanJS) {

	"use strict";

	var Type = SpartanJS.require('Type');

	return function(selector, scope) {
		var _tempNid
			, _find
			, _onlyElements
			, _qsa;

		// Temporary nid, used for scoping
		_tempNid = 'Dom'+ -(new Date());

		// Run selector for each element in scope
		_find = function(selector, scope) {
			if(!Type.is('String', selector)) {
				return [];
			}
			var i, n, j
				, nodeList
				, results = [];

			scope = Type.is('Array', scope) ? scope : [scope];
			scope = _onlyElements(scope);
			scope = scope.length ? scope : [undefined];

			// search
			for(i = 0, n = scope.length; i < n; i++) {
				nodeList = _qsa(selector, scope[i]);
				for(j = nodeList.length; j--; results.unshift(nodeList[j]));
			}
			return results;
		};

		// Removes any non-elements from the set
		_onlyElements = function(set) {
			var i, n
				, elements = [];

			// Ensure array
			set = Type.is('Array', set) ? set : [set];

			// Filter elements
			for(i = 0, n = set.length; i < n; i++) {
				if(Type.is('Element', set[i])) {
					elements.push(set[i]);
				}
			}

			return elements;
		};

		// Find elements within optional scope using querySelectorAll
		_qsa = function(selector, scope) {
			var _scopeNid
				, results;

			if(scope) {
				_scopeNid = scope.getAttribute("id");

				// Ensure scope element has an id.
				if(!_scopeNid) {
					scope.setAttribute("id", _tempNid);
				}

				// Create scoped selector
				selector = '#' + (_scopeNid ? _scopeNid : _tempNid) + ' ' + selector;
			}

			// Execute query
			results = document.querySelectorAll(selector);

			// Remove temp nid from scope
			if(scope && !_scopeNid) {
				scope.removeAttribute("id");
			}

			return results;
		};

		// Do the stuff!
		return _find(selector, scope);
	};

});