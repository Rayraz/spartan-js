SpartanJS.register('DeferredImage', function(SpartanJS) {

	"use strict";

	var // SpartanJS Components
			DomEvent = SpartanJS.require('DomEvent')
		, Event    = SpartanJS.require('Event')
		, Style    = SpartanJS.require('Style')
		, Type     = SpartanJS.require('Type')
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
			DomEvent.on(this.img, 'load', this.onLoad, this);
			return this;
		}
		else {
			return new DeferredImage(options);
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
				this.onLoad();
			}
			else if(!this.loading) {
				this.loading = true;
				this.img.src = this.src;
			}
		},
		onLoad: function() {
			this.loading  = false;
			this.loaded   = true;
			this.$img.src = this.src;
			Style.set(this.$img, { width: this.img.width, height: this.img.height });
			this.event.trigger('loaded', this);
		}
	};

	return DeferredImage;

});