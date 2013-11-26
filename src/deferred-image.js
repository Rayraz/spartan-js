SpartanJS.register('DeferredImage', function(SpartanJS) {

	"use strict";

	var // SpartanJS Components
			DomEvents = SpartanJS.require('DomEvents')
		, Events    = SpartanJS.require('Events')
			// Local
		, DeferredImage;

	DeferredImage = function($img, src) {
		if(this instanceof DeferredImage) {
			this.events  = new Events();
			this.$img    = $img;
			this.src     = src || $img.getAttribute('data-src');
			this.loaded  = false;
			this.loading = false;
			this.img     = new Image();
			DomEvents.on(this.img, 'load', this._onLoad, this);
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
			this.$img.setAttribute('data-width', this.img.width);
			this.$img.setAttribute('data-height', this.img.height);
			this.events.trigger('loaded', this);
		}
	};

	return DeferredImage;

});