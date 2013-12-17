SpartanJS.register('Webform', function(SpartanJS) {

	"use strict";

	var // SpartanJS Components
			Obj        = SpartanJS.require('Obj')
		, Dom        = SpartanJS.require('Dom')
		, Type       = SpartanJS.require('Type')
		, Validators = SpartanJS.require('WebformValidators')
			// Local
		, Webform
		, FormElement
		, FormValidationError
		, config;

	Webform = function(config) {
		var fieldName
			, fieldConfig;

		this.$form  = Dom(config.form)[0];
		this.fields = {};

		for(fieldName in config.fields) {
			if(config.fields.hasOwnProperty(fieldName)) {
				fieldConfig = {
					name:       fieldName,
					selector:   config.fields[fieldName],
					validation: config.validation[fieldName]
				};
				this.fields[fieldName] = new FormElement(this, fieldConfig);
			}
		}
	};
	Webform.prototype = {
		serialize: function(fieldNames) {
			var i, n
				, fields = this.fields
				, fieldName
				, data = {};

			fieldNames = fieldNames || Obj.keys(fields);
			fieldNames = Type.is('Array', fieldNames) ? fieldNames : [fieldNames];
			for(i = 0, n = fieldNames.length; i < n; i++) {
				fieldName = fieldNames[i];
				if(fields.hasOwnProperty(fieldName)) {
					data[fieldName] = fields[fieldName].serialize();
				}
			}

			return (fieldNames.length > 1) ? data : data[fieldName];
		},
		validate: function(fieldNames, onError, ctx) {
			var fields = this.fields
				, fieldName;

			// If no fieldNames were passed, validate all fields
			if(arguments.length == 2) {
				ctx        = onError;
				onError    = fieldNames;
				fieldNames = Obj.keys(this.fields);
			}

			for(fieldName in fields) {
				if(fields.hasOwnProperty(fieldName)) {
					fields[fieldName].validate(onError, ctx);
				}
			}
		}
	};

	FormElement = function(webform, config) {
		this.id         = config.id;
		this.name       = config.name;
		this.selector   = config.selector || '[name="'+this.name+'"]';
		this.validation = config.validation;
		this.webform    = webform;
		this.$form      = webform.$form;
		this.$inputs    = Dom(this.selector, webform.$form);
	}
	FormElement.prototype = {
		serialize: function() {
			var i, n, j, o
				, $inputs = this.$inputs
				, $input
				, values = []
				, $options
				, $option;

			for(i = 0, n = $inputs.length; i < n; i++) {
				$input = $inputs[i];
				// Checkable fields
				if(/radio|checkbox/.test($input.type)) {
					if($input.checked) {
						values.push($input.value);
					}
				}
				// Selectable fields
				else if($input.tagName == 'SELECT') {
					$options = this._ensureOptions($input);
					for(j = 0, o = $options.length; j < o; j++) {
						$option = $options[i];
						if($option.checked) {
							values.push($option.value);
						}
					}
				}
				// Single-value fields
				else {
					values.push($input.value);
				}
			}

			return (values.length === 1) ? values[0] : values;
		},
		validate: function(onError, ctx) {
			var validation = this.validation
				, validator
				, options
				, error;

			for(validator in validation) {
				if(validation.hasOwnProperty(validator)) {
					options   = validation[validator];
					validator = Validators[validator];
					if(!validator(this, options, this.webform)) {
						error = new FormValidationError(options.error, this, this.webform);
						if(Type.is('Function', onError)) {
							onError.call(ctx, error);
							break;
						}
						else {
							throw error;
						}
					}
				}
			}
		},
		_ensureOptions: function($input) {
			if(!this.options) {
				this.$options = Dom('option', $input);
			}
			return this.$options;
		}
	};

	FormValidationError = function(message, formElement, webform) {
		this.name        = 'FormValidationError';
		this.message     = message;
		this.formElement = formElement;
		this.webform     = webform;
	}
	FormValidationError.prototype = new Error();
	FormValidationError.prototype.constructor = FormValidationError;

	return Webform;

});