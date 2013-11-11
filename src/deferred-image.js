var DeferredImage = (function(Event, Style, DomEvent) {

	"use strict";

	var DeferredImage;

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
			var $img       = this.$img
				, options    = this.options
				, attributes = ['id', 'class', 'alt', 'title', 'src']
				, i
				, attribute;

			if(this.loaded) {
				this.onLoad();
			}
			else if(!this.loading) {
				this.loading = true;
				for(i in attributes) {
					attribute = attributes[i];
					if(options.hasOwnProperty(attribute)) {
						$img[attribute] = options[attribute];
					}
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

})(Event, Style, DomEvent);