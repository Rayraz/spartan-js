var Memoize = function(fn, args, ctx) {
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