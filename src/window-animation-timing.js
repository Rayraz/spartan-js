var WindowAnimationTiming = (function(window) {
  // Local WindowAnimationTiming interface
  var cancelAnimationFrame  = window.cancelAnimationFrame || window.cancelRequestAnimationFrame;
  var requestAnimationFrame = window.requestAnimationFrame;

  // Local WindowAnimationTiming interface polyfill
  (function (window) {
    var i, vendors = ['moz', 'webkit', 'o', 'ms'], lastTime = 0;

    // For a more accurate WindowAnimationTiming interface implementation, ditch the native
    // requestAnimationFrame when cancelAnimationFrame is not present (older versions of Firefox)
    for(i = 0; i < 3 && !cancelAnimationFrame; ++i) {
      cancelAnimationFrame  =  window[vendors[i]+'CancelAnimationFrame']
                            || window[vendors[i]+'CancelRequestAnimationFrame'];
      requestAnimationFrame =  cancelAnimationFrame
                            && window[vendors[i]+'RequestAnimationFrame'];
    }

    if (!cancelAnimationFrame) {
      requestAnimationFrame = function(callback) {
        currentTime, timeToCall;
        currentTime = +new Date();
        timeToCall  = Math.max(0, 16 - (currentTime - lastTime));
        lastTime    = currentTime + timeToCall;
        return window.setTimeout(function() { callback(currentTime + timeToCall); }, timeToCall);
      };

      cancelAnimationFrame = function (id) {
        clearTimeout(id);
      };
    }
  }(window));

  return {
    requestAnimationFrame: requestAnimationFrame,
    cancelAnimationFrame:  cancelAnimationFrame
  };

})(window);