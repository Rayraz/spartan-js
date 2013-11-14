SpartanJS.register('Fun', function() {

	"use strict";

	var Debouncer
		, Memoizer;

	Debouncer = function(delay, fun, ctx, args) {
		if(this instanceof Debouncer) {
			this.reset.apply(this, arguments);
			return this;
		}
		else {
			return new Debouncer(delay, fun, ctx, args);
		}
	};
	Debouncer.prototype = {
		_tick: function() {
			var that = this;
			clearTimeout(this._timeout);
			this._timeout = setTimeout(function() {
				that._fun.apply(that._ctx, that._args);
			}, this._delay);
		},
		go: function(/* polymorphic */) {
			this._args = arguments;
			this._tick();
		},
		reset: function(delay, fun, ctx, args) {
			clearTimeout(this._timeout);
			this._delay = delay;
			this._fun   = fun;
			this._ctx   = ctx;
			this._args  = args;
		}
	};

	Memoizer = function(fun, ctx, args) {
		if(this instanceof Memoizer) {
			this.reset.apply(this, arguments);
			return this;
		}
		else {
			return new Memoizer(fun, ctx, args);
		}
	};
	Memoizer.prototype = {
		reply: function() {
			if(!this._memoized) {
				this._cache    = this._fun.apply(this._ctx, this._args);
				this._memoized = true;
			}
			return this._cache;
		},
		reset: function(fun, ctx, args) {
			if(arguments.length) {
				this._memoized = false;
				this._cache    = undefined;
				this._fun      = fun;
				this._args     = args;
				this._ctx      = ctx;
			}
		}
	};

	return {
		memoizer: Memoizer,
		debounce: Debouncer
	};

});