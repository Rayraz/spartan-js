SpartanJS.register('Uid', function() {

	"use strict";

	var uids = {};

	return function(prefix) {
		prefix       = prefix || 'uid';
		uids[prefix] = uids[prefix] || 0;
		return [prefix, ++uids[prefix]].join('-');
	};

});