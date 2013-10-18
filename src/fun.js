var Fun = (function() {

	var Fun = {
		// Returns a function, that, as long as it continues to be invoked, will not
		// be triggered. The function will be called after it stops being called for
		// N milliseconds. If `immediate` is passed, trigger the function on the
		// leading edge, instead of the trailing.
		debounce: function(func, wait, immediate) {
			var timeout
				, args
				, context
				, timestamp
				, result;

			return function() {
				var later, callNow;

				context   = this;
				args      = arguments;
				timestamp = (new Date()).getTime();
				later     = function() {
					var last = (new Date()).getTime() - timestamp;

					if(last < wait) {
						timeout = setTimeout(later, wait - last);
					}
					else {
						timeout = null;
						if(!immediate) {
							result = func.apply(context, args);
						}
					}
				};
				callNow = immediate && !timeout;
				if(!timeout) {
					timeout = setTimeout(later, wait);
				}
				if(callNow) {
					result = func.apply(context, args);
				}
				return result;
			};
		};
	};

	Fun.memoize = function(fn, args, ctx) {
		if(this instanceof memoize) {
			if(arguments.length) {
				this._memoized = false;
				this._cache    = undefined;
				this._original = fn;
				this._args     = args;
				this._ctx      = ctx;
			}
			else {
				return this.reply();
			}
		}
		else {
			return new memoize(fn, args, ctx);
		}
	};
	Memoize.prototype = {
		reply: function() {
			if(!this._memoized) {
				this._cache    = this._original.apply(this._ctx, this._args);
				this._memoized = true;
			}
			return this._cache;
		},
		expire: function() {
			this._memoized = false;
		}
	};

})();