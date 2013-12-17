SpartanJS.register('WebformValidators', function() {

	"use strict";

	return {
		required: function(formElement, options, webform) {
			var i, n
				, $input = formElement.$inputs[0]
				, values = formElement.serialize()
				, allow_empty;

			// no values
			if(!values.length) {
				return false;
			}

			// Empty value allowed
			allow_empty = /radio|checkbox/.test($input.type)
				|| $input.tagName == 'SELECT';

			// Validate existing values
			for(i = 0, n = values.length; i < n; i++) {
				if(values[i] !== undefined) {
					return allow_empty || values[i] != '';
				}
			}
		},
		equals: function(formElement, options, webform) {
			var value      = formElement.serialize()
				, otherValue = webform.serialize(options.otherElement);

			return value == otherValue;
		}
	};

});