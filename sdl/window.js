mico.require('sdl');
mico.require('dom.graphics');
mico.require('dom.events');

var window = {
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
    document && document.documentElement.dispatchEvent(event);
    dom.graphics.update();
  }
};

sdl.ontimer = function(i) {
  var timer = window._timers[i];
  if (timer) {
    window._timers[i] = null;
    timer.action.apply(this);
    dom.graphics.update();
  }
};

sdl.onmousemove = function(x, y, shift) {
  var event = new dom.MouseEvent;
  event._type = 'mousemove';
  event._shiftKey = shift;
  event._clientX = x;
  event._clientY = y;
  window.dispatchEvent(event);
};

sdl.onmousedown = function(x, y, shift) {
  var event = new dom.MouseEvent;
  event._type = 'mousedown';
  event._shiftKey = shift;
  event._clientX = x;
  event._clientY = y;
  window.dispatchEvent(event);
};

sdl.onmouseup = function(x, y, shift) {
  var event = new dom.MouseEvent;
  event._type = 'mouseup';
  event._shiftKey = shift;
  event._clientX = x;
  event._clientY = y;
  window.dispatchEvent(event);
};
