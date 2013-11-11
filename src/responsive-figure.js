var ResponsiveFigure = (function(Event, DeferredImage, Style) {

	"use strict";

	var ResponsiveFigure;

	ResponsiveFigure = function($figure, options) {
		var i
			, $img
			, queuedImage
			, modes
			, j
			, mode;

		if(this instanceof ResponsiveFigure) {
			this.$figure    = $figure;
			this.$images    = Dom('img', $figure);
			this.event      = new Event();
			this.modes      = {};
			this.activeMode = undefined;
			this.queuedMode = undefined;

			// Images
			for(i in this.$images) {
				$img        = this.$images[i];
				queuedImage = new DeferredImage($img, options);
				modes       = $img.getAttribute('data-responsive-modes').split(' ');
				for(j in modes) {
					this.modes[modes[j]] = queuedImage;
				}
			}
		}
		else {
			return new ResponsiveFigure($figure, viewport);
		}
	};
	ResponsiveFigure.prototype = {
		_checkMode: function(mode) {
			if(!this.modes[mode]) {
				throw Error("No image for mode 'mode' in ResponsiveFigure.");
			}
		},
		isLoaded: function(mode) {
			var mode = mode || this.activeMode;

			this._checkMode(mode);
			return (mode) ? this.modes[mode].loaded : false;
		},
		isLoading: function(mode) {
			var mode = mode || this.queuedMode;

			this._checkMode(mode);
			return (mode) ? this.modes[mode].loading : false;
		},
		load: function(mode) {
			var queuedImage;

			this._checkMode(mode);
			queuedImage = this.modes[mode];

			// If image is already active, trigger loaded callback
			if(mode == this.activeMode) {
				return this.onLoad();
			}
			// If image is already queued, do nothing
			else if(mode == this.queuedMode) {
				return;
			}
			// New image, load it.
			else {
				this.queuedMode = mode;
				queuedImage.event.on('loaded', this.onLoad, this);
				queuedImage.load();
			}
		},
		// This callback only triggers once, explicitly re-bind if needed.
		onLoad: function(loadedImage) {
			var queuedMode = this.queuedMode
				, activeMode = this.activeMode
				, oldImage
				, newImage;

			if(queuedMode) {
				if(activeMode) {
					oldImage = this.modes[activeMode];
					Style.set(oldImage.$img, { display: 'none' });
				}
				newImage = this.modes[queuedMode];
				newImage.event.off('loaded', this.onLoad, this);
				Style.set(newImage.$img, { display: 'block' });
				this.activeMode = queuedMode;
				this.queuedMode = undefined;
			}
			this.event.trigger('loaded', this);
		}
	};

	return ResponsiveFigure;

})(Event, DeferredImage, Style);