SpartanJS.register('Obj', function(SpartanJS) {

	"use strict";

	var Type = SpartanJS.require('Type');

	return {
		extend: function(object, /* polymorphic, */ recursive) {
			var i, n
				, sources
				, source
				, property;

			sources   = Array.prototype.slice.call(arguments, 1);
			recursive = sources.pop();
			if(recursive !== true) {
				sources.push(recursive);
				recursive = false;
			}

			for(i = 0, n = sources.length; i < n; i++) {
				source = sources[i];
				for(property in source) {
					if(source.hasOwnProperty(property)) {
						if(object[property] && Type.is('Object', object[property]) && recursive) {
							object[property] = this.extend.call(this, object[property], source[property], recursive);
						}
						else {
							object[property] = source[property];
						}
					}
				} // properties
			} // sources
			return object;
		},
		keys: function(object) {
			var result = []
				, i;

			for(i in object) {
				if(object.hasOwnProperty(i)) {
					result.push(i);
				}
			}

			return result;
		},
		values: function(object) {
			var result = []
				, i;

			for(i in object) {
				if(object.hasOwnProperty(i)) {
					result.push(object[i]);
				}
			}

			return result;
		}
	};

});