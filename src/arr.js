var Arr = (function() {

	"use strict";

	return {
		unique: function(arr) {
			var result = []
				, i
				, n
				, j
				, match;

			for(i = 0, n = arr.length; i < n; i++) {
				match = false;
				for(j in result) {
					match = arr[i] === result[j];
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
			var result = []
				, i
				, n;

			for(i = 0, n = arr.length; i < n; i++) {
				result.push((arr[i] === remove) ? add : arr[i]);
			}
			return (unique) ? this.unique(result) : result;
		},
		remove: function(arr, value) {
			var result = []
				, i
				, n;

			for(i = 0, n = arr.length; i < n; i++) {
				if(arr[i] !== value) {
					result.push(arr[i]);
				}
			}
			return result;
		},
		indexOf: function(arr, value) {
      var i
      	, n;

      // find index of value
      for(i = 0, n = arr.length; i < n; i++) {
        if(this.array[i] == value) {
          return i;
        }
      }

      // not found
      return -1;
    },
    contains: function(arr, value) {
    	return this.indexOf(arr, value) > -1;
    }
	};

})();