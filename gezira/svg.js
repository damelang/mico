/* This file is part of the Mico project, available under the MIT license:
 *
 *    http://www.opensource.org/licenses/mit-license.php
 */

mico.require('dom.html');
mico.require('dom.svg');
mico.require('dom.graphics');
mico.require('gezira');
mico.require('gezira_glyphserver');

dom.graphics.renderers[null] = function(element) {
  if (!element._graphics)
    element._graphics = new gezira.Node;
  return element._graphics;
};

dom.graphics.renderers[dom.HTMLHtmlElement.tagName] =
dom.graphics.renderers[dom.HTMLBodyElement.tagName] =
dom.graphics.renderers[dom.SVGSVGElement.tagName] =
dom.graphics.renderers[dom.SVGGElement.tagName] = function(element) {
  if (!element._graphics)
    element._graphics = new gezira.Node;
  var gobj = (new gezira.Node).children(
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
        gtransform = new gezira.TranslationNode(transform.matrix.e, transform.matrix.f);
      else if (transform.type == dom.SVGTransform.SVG_TRANSFORM_SCALE)
        gtransform = new gezira.ScaleNode(transform.matrix.a, transform.matrix.d);
      else if (transform.type == dom.SVGTransform.SVG_TRANSFORM_ROTATE)
        gtransform = new gezira.RotationNode(transform.angle);
      else
        continue;
      gobj = gtransform.children(gobj);
    }
  }
  return element._graphics.children(gobj);
};

dom.graphics.renderers[dom.SVGRectElement.tagName] = function(element) {
  if (!element._graphics)
    element._graphics = new gezira.Node;
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
    element._graphics.children(
      (new gezira.ColorOverNode(1, r, g, b)).children(
        (new gezira.PaintNode).children(
          new gezira.LineStream([x1, y1, x1, y2, x1, y2, x2, y2,
                                 x2, y2, x2, y1, x2, y1, x1, y1]))));
  }
  else
    element._graphics.children(new gezira.Node);

  return element._graphics;
};

dom.graphics.renderers[dom.SVGPolygonElement.tagName] = function(element) {
  if (!element._graphics)
    element._graphics = new gezira.Node;
  var fill = element.getAttribute('fill');
  var match = fill && fill.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (match) {
    var r = Number(match[1]) / 255;
    var g = Number(match[2]) / 255;
    var b = Number(match[3]) / 255;
    var points = element.points;
    var lines = new Array(points.numberOfItems * 4);
    lines[0] = lines[lines.length - 2] = points.getItem(0).x;
    lines[1] = lines[lines.length - 1] = points.getItem(0).y;
    for (var p_i = 1, l_i = 2; p_i < points.numberOfItems; p_i++, l_i += 4) {
      lines[l_i    ] = lines[l_i + 2] = points.getItem(p_i).x;
      lines[l_i + 1] = lines[l_i + 3] = points.getItem(p_i).y;
    }
    element._graphics.children(
      (new gezira.ColorOverNode(1, r, g, b)).children(
        (new gezira.PaintNode).children(
          new gezira.LineStream(lines))));
  }
  else
    element._graphics.children(new gezira.Node);

  return element._graphics;
};

dom.graphics.renderers[dom.SVGEllipseElement.tagName] = function(element) {
  if (!element._graphics)
    element._graphics = new gezira.Node;
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
    // TODO put radius into coords instead of using gezira.ScaleNode
    var beziers = [0, 1, a, 1, 1, a, 1, 0, 1, 0, 1, -a, a, -1, 0, -1, 0, -1,
                   -a, -1, -1, -a, -1, 0, -1, 0, -1, a, -a, 1, 0, 1];
    element._graphics.children(
      (new gezira.TranslationNode(cx, cy)).children(
        (new gezira.ScaleNode(rx, ry).children(
          (new gezira.ColorOverNode(1, r, g, b)).children(
            (new gezira.PaintNode).children(
              new gezira.Bezier3Stream(beziers)))))));
  }
  else {
    element._graphics.children(new gezira.Node);
  }

  return element._graphics;
};

dom.graphics.renderers[dom.SVGTextElement.tagName] = function(element) {
  if (!element._graphics)
    element._graphics = new gezira.Node;
  var fill = element.getAttribute('fill');
  var match = fill && fill.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (match) {
    var r = Number(match[1]) / 255;
    var g = Number(match[2]) / 255;
    var b = Number(match[3]) / 255;
    element._graphics.children(
      (new gezira.ColorOverNode(1, r, g, b)).children(
        element.childNodes._nodes.map(function(child) {
          return child._graphics || dom.graphics.render(child);
        })));
  }
  else {
    element._graphics.children(new gezira.Node);
  }

  return element._graphics;
};

gezira._glyphserver = new gezira.Glyphserver;

dom.graphics.renderers[dom.SVGTSpanElement.tagName] = function(element) {
  if (!element._graphics)
    element._graphics = new gezira.Node;
  var x = Number(element.getAttribute('x'));
  var y = Number(element.getAttribute('y'));
  element._graphics.children(
    (new gezira.TranslationNode(x, y)).children(
      (new gezira.ScaleNode(1, -1)).children(
        gezira._glyphserver.glyphs(element.firstChild.data))));
  return element._graphics;
};
