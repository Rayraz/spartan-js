SpartanJS.register('DeferredImage', function(SpartanJS) {

	"use strict";

	var // SpartanJS Components
			DomEvent = SpartanJS.require('DomEvent')
		, Event    = SpartanJS.require('Event')
		, Style    = SpartanJS.require('Style')
			// Local
		, DeferredImage;

	DeferredImage = function($img, src) {
		if(this instanceof DeferredImage) {
			this.event   = new Event();
			this.$img    = $img;
			this.src     = src || $img.getAttribute('data-src');
			this.loaded  = false;
			this.loading = false;
			this.img     = new Image();
			DomEvent.on(this.img, 'load', this._onLoad, this);
			return this;
		}
		else {
			return new DeferredImage($img, src);
		}
	};
	DeferredImage.prototype = {
		isLoaded: function() {
			return this.loaded;
		},
		isLoading: function() {
			return this.loading;
		},
		load: function() {
			if(this.loaded) {
				this._onLoad();
			}
			else if(!this.loading) {
				this.loading = true;
				this.img.src = this.src;
			}
		},
		_onLoad: function() {
			this.loading  = false;
			this.loaded   = true;
			this.$img.src = this.src;
			Style.set(this.$img, { width: this.img.width, height: this.img.height });
			this.event.trigger('loaded', this);
		}
	};

	return DeferredImage;

});