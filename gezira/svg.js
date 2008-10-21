/* This file is part of the Mico project, available under the MIT license:
 *
 *    http://www.opensource.org/licenses/mit-license.php
 */

mico.require('dom.graphics');
mico.require('gezira');

dom.graphics.renderers[dom.HTMLHtmlElement.tagName] =
dom.graphics.renderers[dom.HTMLBodyElement.tagName] =
dom.graphics.renderers[dom.SVGSVGElement.tagName] =
dom.graphics.renderers[dom.SVGGElement.tagName] = function(element) {
  if (!element._graphics)
    element._graphics = new gezira.Parent;
  var gobj = (new gezira.Group).children(
    element.childNodes._nodes.map(function(child) {
      return child._graphics || dom.graphics.render(child);
    })
  );
  if (element.hasAttribute('transform')) {
    var list = element.transform.baseVal;
    for (var i = list.numberOfItems - 1; i >= 0; i--) {
      var gtransform;
      var transform = list.getItem(i);
      if (transform.type == dom.SVGTransform.SVG_TRANSFORM_TRANSLATE)
        gtransform = new gezira.Translation(transform.matrix.e, transform.matrix.f);
      else if (transform.type == dom.SVGTransform.SVG_TRANSFORM_SCALE)
        gtransform = new gezira.Scale(transform.matrix.a, transform.matrix.d);
      else if (transform.type == dom.SVGTransform.SVG_TRANSFORM_ROTATE)
        gtransform = new gezira.Rotation(transform.angle);
      else
        continue;
      gobj = gtransform.child(gobj);
    }
  }
  return element._graphics.child(gobj);
};

dom.graphics.renderers[dom.SVGRectElement.tagName] = function(element) {
  if (!element._graphics)
    element._graphics = new gezira.Parent;
  var fill = element.getAttribute('fill');
  var match = fill && fill.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (match) {
    var r = Number(match[1]) / 255;
    var g = Number(match[2]) / 255;
    var b = Number(match[3]) / 255;
    var x1 = element.x.baseVal.value;
    var y1 = element.y.baseVal.value;
    var x2 = x1 + element.width.baseVal.value
    var y2 = y1 + element.height.baseVal.value
    element._graphics.child(
      (new gezira.ColorOver(1, r, g, b)).child(
        (new gezira.Composite).child(
          new gezira.Lines([x1, x1, x1, x2, x2, x2, x2, x1],
                           [y1, y2, y2, y2, y2, y1, y1, y1]))));
  }
  else
    element._graphics.child(new gezira.Object);

  return element._graphics;
};

dom.graphics.renderers[dom.SVGPolygonElement.tagName] = function(element) {
  if (!element._graphics)
    element._graphics = new gezira.Parent;
  var fill = element.getAttribute('fill');
  var match = fill && fill.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (match) {
    var r = Number(match[1]) / 255;
    var g = Number(match[2]) / 255;
    var b = Number(match[3]) / 255;
    var points = element.points;
    var xs = new Array(points.numberOfItems * 2);
    var ys = new Array(points.numberOfItems * 2);
    xs[0] = xs[points.numberOfItems * 2 - 1] = points.getItem(0).x;
    ys[0] = ys[points.numberOfItems * 2 - 1] = points.getItem(0).y;
    for (var i = 1; i < points.numberOfItems; i++) {
      xs[i * 2] = xs[i * 2 - 1] = points.getItem(i).x;
      ys[i * 2] = ys[i * 2 - 1] = points.getItem(i).y;
    }
    element._graphics.child(
      (new gezira.ColorOver(1, r, g, b)).child(
        (new gezira.Composite).child(
          new gezira.Lines(xs, ys))));
  }
  else
    element._graphics.child(new gezira.Object);

  return element._graphics;
};

dom.graphics.renderers[dom.SVGEllipseElement.tagName] = function(element) {
  if (!element._graphics)
    element._graphics = new gezira.Parent;
  var fill = element.getAttribute('fill');
  var match = fill && fill.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (match) {
    var r = Number(match[1]) / 255;
    var g = Number(match[2]) / 255;
    var b = Number(match[3]) / 255;
    var cx = element.cx.baseVal.value;
    var cy = element.cy.baseVal.value;
    var rx = element.rx.baseVal.value;
    var ry = element.ry.baseVal.value;
    var a = 0.552284749830794;
    var xs = [0, a, 1, 1,  1,  1,  a,  0,   0, -a, -1, -1,  -1, -1, -a, 0];
    var ys = [1, 1, a, 0,  0, -a, -1, -1,  -1, -1, -a,  0,   0,  a,  1, 1];

    // TODO put radius into xs and ys instead of using gezira.Scale
    element._graphics.child(
      (new gezira.Translation(cx, cy)).child(
        (new gezira.Scale(rx, ry).child(
          (new gezira.ColorOver(1, r, g, b)).child(
            (new gezira.Composite).child(
              new gezira.Bezier3s(xs, ys)))))));
  }
  else {
    element._graphics.child(new gezira.Object);
  }

  return element._graphics;
};
