var Arr = (function() {

  "use strict";

  return {
    unique: function(arr) {
      var result = [], i, j, match;
      for(i = 0; i < arr.length; i++) {
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
      var result = [], i;
      for(i = 0; i < arr.length; i++) {
        result.push((arr[i] === remove) ? add : arr[i]);
      }
      return (unique) ? this.unique(result) : result;
    },
    remove: function(arr, value) {
      var result = [], i;
      for(i = 0; i < arr.length; i++) {
        if(arr[i] !== value) {
          result.push(arr[i]);
        }
      }
      return result;
    }
  };
})();