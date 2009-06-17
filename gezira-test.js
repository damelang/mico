system.load('mico.js');
mico.require('sdl');
mico.require('gezira');
mico.require('gezira_glyphserver');

var renderer = new gezira.Renderer(sdl.videoSurface.pixels,
                                   sdl.videoSurface.width,
                                   sdl.videoSurface.height,
                                   sdl.videoSurface.pitch,
                                   sdl.videoSurface.bytesPerPixel);

var flower = new gezira.Bezier3Stream([
    0, 0, -30, 33.3, -30, 66.6, 0, 100,
    0, 100, 30, 66.6, 30, 33.3, 0, 0,
    0, 0, 33.3, 30, 66.6, 30, 100, 0,
    100, 0, 66.6, -30, 33.3, -30, 0, 0,
    0, 0, 30, -33.3, 30, -66.6, 0, -100,
    0, -100, -30, -66.6, -30, -33.3, 0, 0,
    0, 0, -33.3, -30, -66.6, -30, -100, 0,
    -100, 0, -66.6, 30, -33.3, 30, 0, 0
]);

var star = new gezira.LineStream([
    100.0, 0.0, -80.9017, 58.77852,
    -80.9017, 58.77852, 30.90169, -95.10566,
    30.90169, -95.10566, 30.90169, 95.10565,
    30.90169, 95.10565, -80.9017, -58.77853,
    -80.9017, -58.77853, 100.0, 0.0
]);

var glyphserver = new gezira.Glyphserver;
/*
var metrics = glyphserver.metrics('H');
system.print('H: (' + metrics[0] + ', ' + metrics[1] + ')');
var metrics = glyphserver.metrics('i');
system.print('i: (' + metrics[0] + ', ' + metrics[1] + ')');
*/
var glyphs = glyphserver.glyphs('Gezira');

var dclip = -1;
var clipSize = sdl.videoSurface.width;
var clip = new gezira.ClipNode(0, 0, clipSize, clipSize);
var angle = 0;
var rotation = new gezira.RotationNode(angle);
var scene =
  (new gezira.ColorBackgroundNode(1, 1, 1)).children(
      clip.children(
        (new gezira.ColorOverNode(1, 0, 0.5, 0.5)).children(
          (new gezira.TranslationNode(sdl.videoSurface.width / 2,
                                      sdl.videoSurface.height / 2)).children(
            rotation.children(
              (new gezira.PaintNode).children(glyphs))))));
/*
*/

/*
var scene =
  (new gezira.ColorBackgroundNode(1, 1, 1)).children(
    (new gezira.ColorOverNode(1, 0, 0.5, 0.5)).children(
      (new gezira.PaintNode).children(star)));
*/

/*
while (true) {
  rotation.angle = (angle += 0.1);
  renderer.render(scene);
  sdl.videoSurface.update();
}
*/

sdl.ontimer = function () {
  rotation.angle = (angle -= 0.01);
  clipSize += dclip;
  if (clipSize <= sdl.videoSurface.width / 2 ||
      clipSize > sdl.videoSurface.width)
    dclip = -dclip; 
  clip.xmin = clip.ymin = sdl.videoSurface.width - clipSize;
  clip.xmax = clip.ymax = clipSize;
  renderer.render(scene);
  sdl.videoSurface.update();
  sdl.addTimer(1);
};

sdl.addTimer(1);
sdl.loop();

//mico.require('dom.graphics', 'dom.events', 'dom.html', 'dom.svg',
//             'gezira.svg', 'sdl.events', 'sdl.window');
