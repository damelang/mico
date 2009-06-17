var sdl = {
  addTimer: function(delay, i) {
    /* TODO add some recursion detection and allow for returns
     * back to the top level, then trigger timers again...?
     */
    sdl.ontimer(i);
  },
  loop: function() {}
};

sdl.videoSurface = {
  update: function() {}
};
