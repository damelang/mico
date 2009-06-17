mico.require('sdl');
mico.require('dom.graphics');
mico.require('dom.events');

var window = this;

mico.extend(window, {
  parent: window,
  alert: system.print,
  console: {log: system.print},
  navigator: {userAgent: "Mico"},
  _timers: [],

  setTimeout: function(action, delay) {
    var i = 0;
    while (window._timers[i])
      i++;
    var timer = window._timers[i] = {action: action};
    // NOTE timer may fire before the assignment occurs
    timer.id = sdl.addTimer(delay, i);
    return i;
  },

  dispatchEvent: function(event) {
    window.document && window.document.documentElement.dispatchEvent(event);
    window.refresh();
  },

  refresh: function() {
    dom.graphics.update();
    /* FIXME ugly hack */
    if (window._graphics)
      window._graphics.render(window.document._graphics);
    sdl.videoSurface.update();
  }
});

sdl.ontimer = function(i) {
  var timer = window._timers[i];
  if (timer) {
    window._timers[i] = null;
    timer.action.apply(window);
    window.refresh();
  }
};

sdl.onmousemove = function(x, y) {
  var event = new dom.MouseEvent;
  event._type = 'mousemove';
  event._shiftKey = sdl.shiftKeyDown ();
  event._altKey = sdl.altKeyDown ();
  event._clientX = x;
  event._clientY = y;
  window.dispatchEvent(event);
};

sdl.onmousedown = function(x, y) {
  var event = new dom.MouseEvent;
  event._type = 'mousedown';
  event._shiftKey = sdl.shiftKeyDown();
  event._altKey = sdl.altKeyDown();
  event._clientX = x;
  event._clientY = y;
  window.dispatchEvent(event);
};

sdl.onmouseup = function(x, y) {
  var event = new dom.MouseEvent;
  event._type = 'mouseup';
  event._shiftKey = sdl.shiftKeyDown();
  event._altKey = sdl.altKeyDown();
  event._clientX = x;
  event._clientY = y;
  window.dispatchEvent(event);
};
