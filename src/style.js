SpartanJS.register('Style', function(SpartanJS) {

	"use strict";

	var Type = SpartanJS.require('Type')
		, docEl
		, _prefixMap
		, nonstandard
		, _pixelPropertyRegexp
		, _pixelPropAxisRegexp
		, _isPixelValueRegexp
		, _hasUnitRegexp
		, _nonDigitRegexp
		, _getPixelValue
		, _ieAlphaFilter
		, _ieAlphaRegexp
		, _getIeFilter
		, _customHandlers
		, _getProperty
		, _setProperty;

	docEl = document.documentElement;

	// Vendor Prefix mapping
	//
	// This function generates a mapping of unprefixed css properties to their
	// vendor-prefixed counterparts as declared in the CSSStyleDeclaration object.
	_prefixMap = (function(docEl) {
		var i, n
			, prefixes
			, styles
			, property
			, prefix
			, unprefixed
			, map = [];

		prefixes = ['webkit','Webkit','Moz', 'ms', 'O', 'khtml', 'Khtml'];

		// TODO: IE Test
		styles = document.documentElement.currentStyle || window.getComputedStyle(docEl, '');
		for(property in styles) {
			// !Important: Do not check if styles.hasOwnProperty(property).
			// Firefox says the computed styles doesn't own the properties we need.
			for(i = 0, n = prefixes.length; i < n; i++) {
				prefix = prefixes[i];
				if(property != 'length' && !Type.is('Function', property) && property.match(/[a-zA-Z]/)) {
					if(property.indexOf(prefix) === 0) {
						unprefixed      = property.substring(prefix.length, property.length);
						unprefixed      = unprefixed.charAt(0).toLowerCase() + unprefixed.slice(1);
						map[unprefixed] = property;
						break;
					}
					else {
						map[property] = property;
					}
				} // prefixes
			}
		}
		return map;
	})(docEl);

	// IE bullshit detection
	nonstandard = {
		ieOpacity: !!docEl.className.match(/(ie8|ielt9)/gi),
		ieFloat:   !!("cssFloat" in docEl.style)
	};

	// Convert non-pixel values to pixels values (IE<=8) element.currentStyle
	_pixelPropertyRegexp = /(top|right|bottom|left|^(fontSize|lineHeight|width|height)$)/i;
	_pixelPropAxisRegexp = /(right|left|^(width)$)/i;
	_isPixelValueRegexp  = /^((-\d+\.\d+|\d+\.\d+|-\.\d+|\.\d+|-\d+|\d+)(px))?$/i;
	_hasUnitRegexp       = /^auto$|[a-zA-Z%]$/i;
	_nonDigitRegexp      = /[^-\d\.]/g;
	_getPixelValue       = function(element, property, value) {
		if(_isPixelValueRegexp.test(value)) {
			return value;
		}
		var style
			, runtimeStyle
			, hasRuntimeStyle = !!element.runtimeStyle
			, axis;

		// Determine axis
		axis = _pixelPropAxisRegexp.test(property) ? 'left' : 'top';

		// Remember original values
		style = element.style[axis];
		if(hasRuntimeStyle) {
			runtimeStyle = element.runtimeStyle[axis];
		}

		// Calculate pixel value
		if(hasRuntimeStyle) {
			element.runtimeStyle[axis] = element.currentStyle[axis];
		}
		element.style[axis] = value || 0;
		value               = (axis == 'left') ? element.style.pixelLeft : element.style.pixelTop;

		// Re-apply original values
		element.style[axis] = style;
		if(hasRuntimeStyle) {
			element.runtimeStyle[axis] = runtimeStyle;
		}

		return value;
	};


	// Custom Style Handlers
	// ---------------------

	// Stuff for IE alpha filter
	_ieAlphaFilter = 'DXImageTransform.Microsoft.Alpha';
	_ieAlphaRegexp = new RegExp("\\s*progid:" + _ieAlphaFilter + "\\([^\\)]+?\\)", "i");
	_getIeFilter   = function(node) {
		try {
			return node.filters.item(_ieAlphaFilter);
		} catch(e) {
			return null;
		}
	};

	_customHandlers = {
		get: {
			"float": function(node) {
				var property = nonstandard.ieFloat ? "cssFloat" : "styleFloat";
				return _getProperty(node, property);
			},
			opacity: function(node) {
				if(nonstandard.ieOpacity) {
					var filter = _getIeFilter(node);
					return filter ? filter.Opacity / 100 : 1;
				}
				return _getProperty(node, 'opacity');
			},
			width: function(node) {
				return _getProperty(node, 'width');
			},
			height: function(node) {
				return _getProperty(node, 'height');
			},
			clientWidth: function(node) {
				return node.clientWidth;
			},
			clientHeight: function(node) {
				return node.clientHeight;
			},
			offsetWidth: function(node) {
				return node.offsetWidth;
			},
			offsetHeight: function(node) {
				return node.offsetHeight;
			},
			scrollWidth: function(node) {
				return node.scrollWidth;
			},
			scrollHeight: function(node) {
				return node.scrollHeight;
			},
			offsetLeft: function(node) {
				var boundingClientRect = node.getBoundingClientRect()
					, docEl              = document.documentElement
					, win                = window;

				return boundingClientRect.left + (win.pageXOffset || docEl.scrollLeft) - (docEl.clientLeft || 0);
			},
			offsetTop: function(node) {
				var boundingClientRect = node.getBoundingClientRect()
					, docEl              = document.documentElement
					, win                = window;

				return boundingClientRect.top + (win.pageYOffset || docEl.scrollTop) - (docEl.clientTop || 0);
			}
		},
		set: {
			"float": function(node, value) {
				var property = nonstandard.ieFloat ? "cssFloat" : "styleFloat";
				return _setProperty(node, property, value);
			},
			opacity: function(node, value) {
				var filter;

				if(nonstandard.ieOpacity) {
					value  = value >= 1 ? 100 : value * 100;
					filter = _getIeFilter(node);
					if(value >= 100 && filter) {
						node.style.filter.replace(_ieAlphaRegexp, "");
						return;
					}
					else if(filter) {
						filter.Opacity = value;
					}
					else {
						node.style.filter += " progid:" + _ieAlphaFilter + "(Opacity=" + value + ")";
					}
					filter.Enabled = true;
					return;
				}
				else {
					return _setProperty(node, "opacity", value);
				}
			}
		}
	};

	// Default style getter
	_getProperty = function(node, property) {
		var computed
			, value;

		if(!node.currentStyle) {
			computed = document.defaultView.getComputedStyle(node, "");
			value    = computed.getPropertyValue(property) /* IE9 with css filters */
				|| computed[_prefixMap[property]];
		}
		else { // IE<=8
			value = node.currentStyle[property];
		}
		return _pixelPropertyRegexp.test(property)
			? _getPixelValue(node, property, value)
			: value;
	};

	// Default style setter
	_setProperty = function(node, property, value) {
		if(value === undefined) {
			throw new Error("Bad argument: value is undefined for property: '" + property + "'.");
		}
		if(_pixelPropertyRegexp.test(property)) {
			value = _hasUnitRegexp.test(value) ? value : value + 'px';
		}
		node.style[_prefixMap[property]] = value;
	};

	// API
	// ---

	return {
		registerHandler: function(property, getter, setter) {
			if(Type.is('Function', getter)) {
				_customHandlers.get[property] = getter;
			}
			if(Type.is('Function', setter)) {
				_customHandlers.set[property] = setter;
			}
		},
		get: function(node, properties, unitless) {
			if(node === document) {
				node = document.documentElement;
			}
			if(!Type.is('Element', node)) {
				return {};
			}
			var i, n
				, styles = {}
				, style
				, asArray = Type.is('Array', properties);

			properties = asArray ? properties : [properties];

			for(i = 0, n = properties.length; i < n; i++) {
				style = _customHandlers.get[properties[i]]
					? _customHandlers.get[properties[i]](node)
					: _getProperty(node, properties[i]);
				styles[properties[i]] = (unitless)
					? parseFloat(("" + style).replace(_nonDigitRegexp))
					: style;
			}

			return (asArray) ? styles : styles[properties[--i]];
		},
		set: function(node, styles) {
			if(node === document) {
				node = document.documentElement;
			}
			if(!Type.is('Element', node)) {
				return {};
			}
			var property, value;
			for(property in styles) {
				if(styles.hasOwnProperty(property)) {
					value = styles[property];
					if(_customHandlers.set[property]) {
						_customHandlers.set[property](node, value);
					}
					else {
						_setProperty(node, property, value);
					}
				}
			}
		}
	};

});