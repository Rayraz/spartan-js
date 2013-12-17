SpartanJS.register('Arr', function() {

	"use strict";

	return {
		unique: function(arr) {
			var i, n, j, o
				, result = []
				, match;

			for(i = 0, n = arr.length; i < n; i++) {
				match = false;
				for(j = 0, o = result.length; j < o; j++) {
					if(arr[i] === result[j]) {
						match = true;
						break;
					}
				}
				if(!match) {
					result.push(arr[i]);
				}
			}
			return result;
		},
		add: function(arr, value, unique) {
			arr.push(value);
			return (unique) ? this.unique(arr) : arr;
		},
		replace: function(arr, remove, add, unique) {
			var i, n
				, result = [];

			for(i = 0, n = arr.length; i < n; i++) {
				result.push((arr[i] === remove) ? add : arr[i]);
			}
			return (unique) ? this.unique(result) : result;
		},
		remove: function(arr, value) {
			var i, n
				, result = [];

			for(i = 0, n = arr.length; i < n; i++) {
				if(arr[i] !== value) {
					result.push(arr[i]);
				}
			}
			return result;
		},
		indexOf: function(arr, value) {
			var i, n;

			// find index of value
			for(i = 0, n = arr.length; i < n; i++) {
				if(arr[i] == value) {
					return i;
				}
			}

			// not found
			return -1;
		},
		contains: function(arr, value) {
			return this.indexOf(arr, value) > -1;
		},
		intersect: function(arr1, arr2 /* more arrays */) {
			var a, b
				, i, n, j, o
				, result = [];

			a = arr1.slice(0) || [];
			b = arr2.slice(0) || [];
			n = a.length;
			o = b.length;

			for(i = 0; i < n; i++) {
				for(j = 0; j < o; j++) {
					if(a[i] == b[j]) {
						result.push(a[i]);
						break;
					}
				}
			}

			return (arguments.length == 2)
				? result
				: this.intersect.apply(this, [result].concat(
						Array.prototype.slice.call(arguments, 2)
					));
		},
		union: function(arr1, arr2 /* more arrays */) {
			var a, b
				, i, n;

			a = arr1.slice(0) || [];
			b = arr2.slice(0) || [];
			n = b.length;

			for(i = 0; i < n; i++) {
				if(!this.contains(a, b[i])) {
					a.push(b[i]);
				}
			}
			console.log(arguments, a);

			return (arguments.length == 2)
				? a
				: this.union.apply(this, [a].concat(
						Array.prototype.slice.call(arguments, 2)
					));
		}
	};

});