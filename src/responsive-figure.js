SpartanJS.register('ResponsiveFigure', function(SpartanJS) {

	"use strict";

	var // SpartanJS Components
			Dom           = SpartanJS.require('Dom')
		, DeferredImage = SpartanJS.require('DeferredImage')
		, Events        = SpartanJS.require('Events')
		, Style         = SpartanJS.require('Style')
			// Local
		, ResponsiveFigure;

	ResponsiveFigure = function($figure, options) {
		var i, n, j, o
			, $images
			, $image
			, queuedImage
			, modes;

		if(this instanceof ResponsiveFigure) {
			this.$figure    = $figure;
			this.$images    = $images = Dom('img', $figure);
			this.events     = new Events();
			this.modes      = {};
			this.activeMode = undefined;
			this.queuedMode = undefined;

			// Images
			for(i = 0, n = $images.length; i < n; i++) {
				$image      = $images[i];
				queuedImage = new DeferredImage($image, options);
				modes       = $image.getAttribute('data-responsive-modes').split(' ');
				for(j = 0, o = modes.length; j < o; j++) {
					this.modes[modes[j]] = queuedImage;
				}
			}
		}
		else {
			return new ResponsiveFigure($figure, options);
		}
	};
	ResponsiveFigure.prototype = {
		getDimensions: function() {
			var img = this.modes[this.activeMode].img;

			return {
				width:  img.width,
				height: img.height,
				ratio:  img.width / img.height
			};
		},
		getImage: function() {
			return this.modes[this.activeMode].$img;
		},
		_checkMode: function(mode) {
			if(!this.modes[mode]) {
				throw Error("No image for mode '" + mode + "' in ResponsiveFigure.");
			}
		},
		isLoaded: function(mode) {
			mode = mode || this.activeMode;
			return (mode && this._checkMode(mode)) ? this.modes[mode].loaded : false;
		},
		isLoading: function(mode) {
			mode = mode || this.queuedMode;
			return (mode && this._checkMode(mode)) ? this.modes[mode].loading : false;
		},
		load: function(mode) {
			var queuedImage;

			this._checkMode(mode);
			queuedImage = this.modes[mode];

			// If image is already active, trigger loaded callback
			if(mode == this.activeMode) {
				return this._onLoad();
			}
			// If image is already queued, do nothing
			else if(mode == this.queuedMode) {
				return;
			}
			// New image, load it.
			else {
				this.queuedMode = mode;
				queuedImage.events.on('loaded', this._onLoad, this);
				queuedImage.load();
			}
		},
		// This callback only triggers once, explicitly re-bind if needed.
		_onLoad: function() {
			var queuedMode = this.queuedMode
				, activeMode = this.activeMode
				, oldImage
				, newImage;

			if(queuedMode) {
				newImage = this.modes[queuedMode];
				newImage.events.off('loaded', this._onLoad, this);
				Style.set(newImage.$img, { display: 'block' });
				if(activeMode) {
					oldImage = this.modes[activeMode];
					Style.set(oldImage.$img, { display: 'none' });
				}
				this.activeMode = queuedMode;
				this.queuedMode = undefined;
			}
			this.events.trigger('loaded', this);
		}
	};

	return ResponsiveFigure;

});