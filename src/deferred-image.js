SpartanJS.register('DeferredImage', function(SpartanJS) {

	"use strict";

	var // SpartanJS Components
			DomEvents = SpartanJS.require('DomEvents')
		, Events    = SpartanJS.require('Events')
			// Local
		, DeferredImage;

	DeferredImage = function($img, src) {
		if(this instanceof DeferredImage) {
			this.events               = new Events();
			this.$img                 = $img;
			this.src                  = src || $img.getAttribute('data-src');
			this.loaded               = false;
			this.loading              = false;
			this.img                  = new Image();
			this.img.style['display'] = 'block';
			this.img.style['height']  = 0;
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
			var that = this;
			if(this.loaded) {
				this._onLoad();
			}
			else if(!this.loading) {
				this.loading = true;
				document.documentElement.appendChild(this.img);
				this.img.onload = function() {
					that._onLoad();
				};
				this.img.src = this.src;
			}
		},
		_onLoad: function() {
			try {
				document.documentElement.removeChild(this.img);
			} catch(e) {
				// ignore error
			}
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