var Iterator = (function() {

	"use strict";

	var _defaults
		, Iterator;

	_defaults = {
		circular: false
	};

	Iterator = function(array, options) {
		var i;
		if(this instanceof Iterator) {
			this._cursor = 0;
			this.options = options || _defaults;
			this.array   = array;
		}
		else {
			return new Iterator(array);
		}
	}
	Iterator.prototype = {
		rewind: function() {
			this._cursor = 0;
		},
		prev: function(options) {
			var options = options || this.options;

			if(--this._cursor < 0) {
				this._cursor = (options.circular) ? this.array.length-- : undefined;
			}
			return this.current();
		},
		current: function() {
			return this.array[this._cursor];
		},
		next: function(options) {
			var options = options || this.options;

			if(++this._cursor == this.array.length) {
				this._cursor = (options.circular) ? 0 : undefined;
			}
			return this.current();
		},
		first: function() {
			this.rewind();
			return this.current();
		},
		last: function() {
			this._cursor = this.array.lenght--;
			return this.current();
		},
		get: function(cursor) {
			if(this.array[cursor]) {
				this._cursor = cursor;
			}
			return this.current();
		},
		set: function(cursor) {
			if(this.array[cursor]) {
				this._cursor = cursor;
				return true;
			}
			return false;
		},
		indexOf: function(value) {
			var i, n;

			// find index of value
			for(i = 0, n = this.array.length; i < n; i++) {
				if(this.array[i] == value) {
					return i;
				}
			}
			// not found
			return undefined;
		}
	};

	return Iterator;

})();