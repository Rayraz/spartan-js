SpartanJS.register('Animation', function(SpartanJS) {

	"use strict";

	var // SpartanJS Components
			Easing                = SpartanJS.require('EasingFunctions', true) || {}
		, Event                 = SpartanJS.require('Event')
		, Style                 = SpartanJS.require('Style')
		, Type                  = SpartanJS.require('Type')
		, WindowAnimationTiming = SpartanJS.require('WindowAnimationTiming')
			// Local WindowAnimationTiming interface
		, cancelAnimationFrame  = WindowAnimationTiming.cancelAnimationFrame
		, requestAnimationFrame = WindowAnimationTiming.requestAnimationFrame
			// Local
		, Animation;

	Animation = function(element) {
		if(!Type.is('Element', element)) {
			return;
		}
		if(this instanceof Animation) {
			if(!this.events || !(this.events instanceof Event)) {
				this.events = new Event();
			}
			this.element        = element;
			this._tweens        = {};
			this._newAnimations = [];
			this._frame         = undefined;
			element.animation   = this;
			return this;
		}
		else {
			return new Animation(element);
		}
	};
	Animation.prototype = {

		// Options
		// -------

		defaults: {
			duration: 300,
			easing:   'linear',
			forceInt: false,
			decay:    0
		},

		// Implementation
		// --------------

		// Extracts numbers from css properties.
		_numberRegexp:      /(-\d+\.\d+|\d+\.\d+|-\.\d+|\.\d+|-\d+|\d+)/i,

		// Finds placeholders in css property templates.
		_placeholderRegexp: /\{(\d+)\}/g,

		// properties that must have integer values
		_intProp: /color|zIndex/i,

		// Implementation > Animations
		// ---------------------------

		// Load a new animation and merge it into the tweens list.
		_loadNewAnimations: function() {
			var animation
				, isNew;

			while(this._newAnimations.length) {
				animation = this._newAnimations.shift();
				animation = this._parseAnimation.apply(this, animation);
				if(animation) {
					isNew = this._hasTweens();
					this._mergeTweens(animation);
					this.events.trigger('animation:' + (isNew ? 'new' : 'merge'), animation);
				}
			}
		},

		// Create an animation for the element.
		_parseAnimation: function(start, end, mode, options) {
			var property
				, properties = []
				, start
				, tween
				, tweens    = 0
				, animation = {};

			// Which properties to animate
			for(property in end) {
				properties.push(property);
			}

			// Start state
			start = start || Style.get(this.element, properties);

			// Create tweens for each property
			for(property in end) {
				tween = this._createTween(property, start[property], end[property], mode, options);
				if(tween) {
					++tweens; animation[property] = tween;
				}
			}
			return (tweens) ? animation : null;
		},

		// Implementation > Tweens
		// -----------------------

		// Create a tween for a css property.
		_createTween: function(property, start, end, mode, options) {
			var i
				, param
				, tween = {
					property:  property,
					startTime: +new Date(),
					distance:  []
				};

			options = options || {};

			// Parse incoming states
			start = !Type.is('Object', start) ? this._parseProperty(String(start)) : start;
			end   = !Type.is('Object', end)   ? this._parseProperty(String(end))   : end;

			// Property template
			tween.tpl = tween.tpl || start.tpl || end.tpl;

			// Set start values
			tween.start     = start.values;

			// Set distance of each transformation
			if(mode == 'transform') {
				tween.distance = end.values;
			}
			else {
				for(i = end.values.length; i--; tween.distance.unshift(end.values[i] - tween.start[i]));
			}

			// Set options.
			for(param in this.defaults) {
				tween[param] = (options[param] !== undefined) ? options[param] : this.defaults[param];
				tween[param] = (end[param] !== undefined)     ? end[param]     : tween[param];
				if(property.match(this._intProp)) {
					tween.forceInt = true;
				}
				if(tween.decay > tween.duration) {
					tween.decay = tween.duration;
				}
			}

			// Validate tween
			if(tween.start.length !== tween.distance.length) {
				throw new Error('Bad tween:', start, end, mode, options);
			}
			else {
				return tween;
			}
		},

		// Do we have any tweens?
		_hasTweens: function() {
			var tween
				, hasTweens = false;

			for(tween in this._tweens) {
				hasTweens = true; break;
			}
			return hasTweens;
		},

		// Merge new tweens into current tween list.
		_mergeTweens: function(tweens) {
			var property
				, tween
				, action;

			for(property in tweens) {
				tween  = tweens[property];
				action = 'new';
				if(this._tweens[property]) {
					action        = 'merge';
					tween.inertia = this._tweens[property].inertia;
				}
				this._tweens[property] = tween;
				this.events.trigger('tween:' + action, tween);
			}
		},

		// Implementation > Properties
		// ---------------------------

		// Extract values from css properties
		_parseProperty: function(property) {
			var segment
				, tpl    = ''
				, values = [];

			property = property.split(this._numberRegexp);
			segment  = property.shift();
			while(segment !== undefined) {
				if(segment.match(this._numberRegexp)) {
					tpl += '{' + values.length + '}';
					values.push(parseFloat(segment));
				}
				else {
					tpl += segment;
				}
				segment = property.shift();
			}
			return {
				tpl:    tpl,
				values: values
			};
		},

		// Insert values into css properties
		_outputProperty: function(tpl, values) {
			return tpl.replace(this._placeholderRegexp, function(match, i) {
				return values[i] !== undefined ? values[i] : match;
			});
		},

		// Implementation > Rendering
		// --------------------------

		_tick: function() {
			var that = this
				, style;

			this._render();
			this._loadNewAnimations();
			if(this._hasTweens()) {
				requestAnimationFrame(function() {
					that._tick();
				});
			}
			else {
				delete this._frame;
				this.events.trigger('animation:done');
			}
		},
		_render: function() {
			var property
				, tween
				, progress
				, i
				, value
				, deltaX
				, deltaT
				, style           = {}
				, hasStyles       = false
				, remainingTweens = {};

			for(property in this._tweens) {

				// Get tween
				tween             = this._tweens[property];
				tween.prevTime    = tween.time || tween.startTime;
				tween.time        = +new Date();
				tween.prevVals    = tween.values || tween.start;
				tween.values      = [];
				tween.pervInertia = tween.inertia || new Array(tween.distance.length);
				tween.inertia     = [];

				// Calculate how far along the animation we currently are
				progress = (tween.time - tween.startTime) / tween.duration;
				progress = (progress > 1) ? 1 : progress;
				progress = (Easing[tween.easing] && Type.is('Function', Easing[tween.easing])) ? Easing[tween.easing](progress) : progress;

				// Iterate values
				for(i = 0; i < tween.start.length; i++) {

					// Calculate new values and inertia
					value            = tween.start[i] + (tween.distance[i] * progress);
					tween.values[i]  = tween.forceInt ? Math.round(value) : value;
					tween.inertia[i] = ((tween.values[i] - tween.prevVals[i]) / (tween.time - tween.prevTime)) * 1000;
				}

				// Generate new style
				style[property] = this._outputProperty(tween.tpl, tween.values);
				hasStyles       = true;

				// Animation not done yet? re-queue the tween.
				if(tween.time - tween.startTime < tween.duration) {
					remainingTweens[property] = tween;
				}
				else {
					this.events.trigger('tween:done', tween);
				}
			}

			// Apply new styles
			if(this.onTick) {
				style = this.onTick(style, this._tweens) || style;
			}
			Style.set(this.element, style);

			// Requeue left-over tweens
			this._tweens = remainingTweens;
		},

		// API
		// ---

		tween: function(to, options) {
			var that = this;

			this._newAnimations.push([null, to, 'tween', options]);
			if(!this._frame) {
				this._frame = requestAnimationFrame(function() {
					that._tick();
				});
			}

			return this;
		},
		transform: function(transformation, options) {
			var that = this;

			this._newAnimations.push([null, transformation, 'transform', options]);
			if(!this._frame) {
				this._frame = requestAnimationFrame(function() {
					that._tick();
				});
			}

			return this;
		},
		stop: function(properties, finish) {
			var property
				, i
				, animation
				, tween;

			// Interrupt animation loop
			cancelAnimationFrame(this._frame);

			// Stop all properties
			if(Type.is('Boolean', properties)) {
				finish     = properties;
				properties = [];
				for(property in this._tweens) {
					properties.push(property);
				}
				for(property in this._newAnimations) {
					properties.push(property);
				}
				return this.stop(properties, finish);
			}

			// Create [property,finish] tuples.
			for(i in properties) {
				property      = properties[i];
				properties[i] = Type.is('Array', property) ? property: [property, finish];
			}

			// Stop tweens
			for(i in properties) {
				property = properties[i][0];
				finish   = properties[i][1];
				tween    = this._tweens[property];

				// Fastforward tween
				if(finish && tween) {
					this._tweens[property].duration = 0;
					this._tweens[property].decay    = 0;
				}

				// Stop tween in mid-animation
				else if(tween) {
					delete this._tweens[property];
					this.event.trigger('tween:interrupted', tween);
				}

				// Remove queued tween
				tween = this._newAnimations[property];
				delete this._newAnimations[property];
				this.event.trigger('tween:cancelled', tween);
			}

			// Continue animation loop
			this._tick();

			return this;
		}
	};

	return Animation;

});