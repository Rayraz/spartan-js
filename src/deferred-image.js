SpartanJS.register('DeferredImage', function(SpartanJS) {

	"use strict";

	var // SpartanJS Components
			DomEvent = SpartanJS.require('DomEvent')
		, Event    = SpartanJS.require('Event')
		, Style    = SpartanJS.require('Style')
		, Type     = SpartanJS.require('Type')
			// Local
		, DeferredImage;

	DeferredImage = function($img, options) {
		if(this instanceof DeferredImage) {
			this.options = options || {};
			// Image src from data-attribute
			if(!this.options.src && Type.is('Element', $img)) {
				this.options.src = $img.getAttribute('data-src');
			}
			this.event   = new Event();
			this.$img    = $img || new Image();
			this.loaded  = false;
			this.loading = false;
			DomEvent.on(this.$img, 'load', this.onLoad, this);
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
			var i, n
				, $img       = this.$img
				, options    = this.options
				, attributes = ['id', 'class', 'alt', 'title', 'src']
				, attribute;

			if(this.loaded) {
				this.onLoad();
			}
			else if(!this.loading) {
				this.loading = true;
				for(i = 0, n = attributes.length; i < n; i++) {
					attribute       = attributes[i];
					$img[attribute] = options[attribute];
				}
				if(options.style) {
					Style.set($img, options.style);
				}
			}
			else {
			}
		},
		onLoad: function() {
			this.loading = false;
			this.loaded  = true;
			this.event.trigger('loaded', this);
		}
	};

	return DeferredImage;

});