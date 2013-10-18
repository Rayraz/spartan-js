var UID = (function() {

	"use strict";

	var id = 0;

	return function() {
		return id++;
	};

})();