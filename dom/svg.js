/* This file is part of the Mico project, available under the MIT license:
 *
 *    http://www.opensource.org/licenses/mit-license.php
 */

mico.require('dom.core');

// TODO this should go in a separate file dedicated to CSS
dom.CSSStyleDeclaration = function() {};
dom.CSSStyleDeclaration.fromString = function(s) { mico.TODO(); };

// TODO missing interfaces (among many others)
// SVGUnitTypes
// SVGURIReference
// css::ViewCSS
// css::DocumentCSS
// events::DocumentEvent
// SVGZoomAndPan
// SVGFitToViewBox
// SVGTests
// SVGLangSpace
// SVGExternalResourcesRequired

// SVGNumber

dom.SVGNumber = function() {};

dom.SVGNumber.fromString = function(s) {
  var object = new dom.SVGNumber;
  object.value = s;
  return object;
};

mico.extend(dom.SVGNumber.prototype, {
  get value() { return this._value; },
  set value(value) { this._value = parseFloat(String(value)) || 0; },
  toString: function() { return String(this.value); }
});

// SVGLength

dom.SVGLength = function() {};

mico.extend(dom.SVGLength, {
  SVG_LENGTHTYPE_UNKNOWN:    0,
  SVG_LENGTHTYPE_NUMBER:     1,
  SVG_LENGTHTYPE_PERCENTAGE: 2,
  SVG_LENGTHTYPE_EMS:        3,
  SVG_LENGTHTYPE_EXS:        4,
  SVG_LENGTHTYPE_PX:         5,
  SVG_LENGTHTYPE_CM:         6,
  SVG_LENGTHTYPE_MM:         7,
  SVG_LENGTHTYPE_IN:         8,
  SVG_LENGTHTYPE_PT:         9,
  SVG_LENGTHTYPE_PC:        10,
  unitTypeToString: ['', '', '%', 'em', 'ex', 'px', 'cm', 'mm', 'in', 'pt', 'pc']
});

dom.SVGLength.fromString = function(s) {
  var object = new dom.SVGLength;
  object.valueAsString = s;
  return object;
};

mico.extend(dom.SVGLength.prototype, {
  get unitType() { return this._unitType; },
  get value() { return this._value; },
  set value(value) { this._value = parseFloat(String(value)) || 0; },
  get valueInSpecifiedUnits() { mico.TODO(); },
  set valueInSpecifiedUnits(value) { mico.TODO(); },
  get valueAsString() {
    var value = this._value;
    // TODO must denormalize other unit types, too
    if (this._unitType == dom.SVGLength.SVG_LENGTHTYPE_PERCENTAGE)
      value *= 100;
    return value + dom.SVGLength.unitTypeToString[this._unitType];
  },
  set valueAsString(value) {
    var match = String(value).match(/(\d*\.?\d*)(%|\w*)/);
    this.value = match && match[1];
    this._unitType = dom.SVGLength.unitTypeToString.
      lastIndexOf(match && match[2] || '');
    // TODO must normalize other unit types, too
    if (this._unitType == dom.SVGLength.SVG_LENGTHTYPE_PERCENTAGE)
      this._value /= 100;
  },
  newValueSpecifiedUnits:
    function(unitType, valueInSpecifiedUnits) { mico.TODO(); },
  convertToSpecifiedUnits: function(unitType) { mico.TODO(); },
  toString: function() { return this.valueAsString; }
});

// SVGPoint

dom.SVGPoint = function() {};

dom.SVGPoint.fromString = function(s) {
  var point = new dom.SVGPoint;
  var coors = s.split(/(?:\s|,)+/);
  point.x = parseFloat(coors[0]) || 0;
  point.y = parseFloat(coors[1]) || 0;
  return point;
};

mico.extend(dom.SVGPoint.prototype, {
  get x() { return this._x; },
  set x(value) { this._x = value; },
  get y() { return this._y; },
  set y(value) { this._y = value; },

  matrixTransform: function(matrix) {
    var point = new dom.SVGPoint;
    point.x = this.x * matrix.a + this.y * matrix.c + matrix.e;
    point.y = this.x * matrix.b + this.y * matrix.d + matrix.f;
    return point;
  },

  toString: function() {
    return this.x + ',' + this.y;
  }
});

// SVGMatrix

dom.SVGMatrix = function() {
  this._a = 1.0; this._c = 0.0; this._e = 0.0;
  this._b = 0.0; this._d = 1.0; this._f = 0.0;
};

mico.extend(dom.SVGMatrix.prototype, {
  get a() { return this._a; },
  set a(value) { this._a = value; },
  get b() { return this._b; },
  set b(value) { this._b = value; },
  get c() { return this._c; },
  set c(value) { this._c = value; },
  get d() { return this._d; },
  set d(value) { this._d = value; },
  get e() { return this._e; },
  set e(value) { this._e = value; },
  get f() { return this._f; },
  set f(value) { this._f = value; },

  multiply: function(b) {
    var a = this;
    var ab = new dom.SVGMatrix;
    ab.a = a.a * b.a + a.c * b.b;       ab.b = a.b * b.a + a.d * b.b;
    ab.c = a.a * b.c + a.c * b.d;       ab.d = a.b * b.c + a.d * b.d;
    ab.e = a.a * b.e + a.c * b.f + a.e; ab.f = a.b * b.e + a.d * b.f + a.f;
    return ab;
  },

  inverse: function() {
    var a = this;
    var b = new dom.SVGMatrix;
    var d = 1 / (a.a * a.d - a.b * a.c);
    b.a =  a.d * d; b.c = -a.c * d; b.e = -a.e * b.a - a.f * b.c;
    b.b = -a.b * d; b.d =  a.a * d; b.f = -a.e * b.b - a.f * b.d;
    return b;
  },

  translate: function(x, y) {
    var matrix = new dom.SVGMatrix;
    matrix.e = x; matrix.f = y
    return matrix.multiply(this);
  },

  scale: function(scaleFactor) {
    return this.scaleNonUniform(scaleFactor, scaleFactor);
  },

  scaleNonUniform: function(scaleFactorX, scaleFactorY) {
    var matrix = new dom.SVGMatrix;
    matrix.a = scaleFactorX;
    matrix.d = scaleFactorY;
    return matrix.multiply(this);
  },

  rotate: function(angle) {
    var matrix = new dom.SVGMatrix;
    matrix.a = Math.cos(angle);
    matrix.b = Math.sin(angle);
    matrix.c = -matrix.b;
    matrix.d = matrix.a;
    return matrix.multiply(this);
  },

  rotateFromVector: function(x, y) { mico.TODO(); },
  flipX: function() { mico.TODO(); },
  flipY: function() { mico.TODO(); },

  skewX: function(angle) {
    var matrix = new dom.SVGMatrix;
    matrix.c = Math.tan(angle);
    return matrix.multiply(this);
  },

  skewY: function(angle) {
    var matrix = new dom.SVGMatrix;
    matrix.b = Math.tan(angle);
    return matrix.multiply(this);
  }
});

// SVGTransform

dom.SVGTransform = function() {
  this._type = dom.SVGTransform.SVG_TRANSFORM_UNKNOWN;
};

mico.extend(dom.SVGTransform, {
  SVG_TRANSFORM_UNKNOWN:   0,
  SVG_TRANSFORM_MATRIX:    1,
  SVG_TRANSFORM_TRANSLATE: 2,
  SVG_TRANSFORM_SCALE:     3,
  SVG_TRANSFORM_ROTATE:    4,
  SVG_TRANSFORM_SKEWX:     5,
  SVG_TRANSFORM_SKEWY:     6,
  typeToString:
    ['unknown', 'matrix', 'translate', 'scale', 'rotate', 'skewX', 'skewY']
});

dom.SVGTransform.fromString = function(s) {
  var transform = new dom.SVGTransform;
  var match = s.match(/(\w+)\s*\((.*)\)/);
  if (match) {
    var args = match[2].split(/(?:\s|,)+/).
      map(function(n) { return parseFloat(n) || 0; });
    switch (match[1]) {
      case 'matrix':
        var matrix = new dom.SVGMatrix;
        matrix.a = args[0]; matrix.b = args[1];
        matrix.c = args[2]; matrix.d = args[3];
        matrix.e = args[4]; matrix.f = args[5];
        transform.setMatrix(matrix);
        break;
      case 'translate':
        transform.setTranslate(args[0], args[1]);
        break;
      case 'scale':
        transform.setScale(args[0], args[1]);
        break;
      case 'rotate':
        transform.setRotate(args[0], args[1], args[2]);
        break;
      case 'skewX':
        transform.setSkewX(args[0]);
        break;
      case 'skewY':
        transform.setSkewY(args[0]);
        break;
    }
  }
  return transform;
};

mico.extend(dom.SVGTransform.prototype, {
  get type() { return this._type; },
  get matrix() { return this._matrix; },
  get angle() { return this._angle; },

  setMatrix: function(matrix) {
    this._type = dom.SVGTransform.SVG_TRANSFORM_MATRIX;
    this._angle = 0;
    this._matrix = new dom.SVGMatrix;
    this._matrix.a = matrix.a; this._matrix.b = matrix.b;
    this._matrix.c = matrix.c; this._matrix.d = matrix.d;
    this._matrix.e = matrix.e; this._matrix.f = matrix.f;
  },

  setTranslate: function(tx, ty) {
    this._type = dom.SVGTransform.SVG_TRANSFORM_TRANSLATE;
    this._angle = 0;
    this._matrix = (new dom.SVGMatrix).translate(tx, ty || 0);
  },

  setScale: function(sx, sy) {
    this._type = dom.SVGTransform.SVG_TRANSFORM_SCALE;
    this._angle = 0;
    this._matrix = (new dom.SVGMatrix).scaleNonUniform(sx, sy || sx);
  },

  setRotate: function(angle, cx, cy) {
    cx && mico.TODO(); // We don't handle the optional cx cy yet
    this._type = dom.SVGTransform.SVG_TRANSFORM_ROTATE;
    this._angle = angle;
    this._matrix = (new dom.SVGMatrix).rotate(angle);
  },

  setSkewX: function(angle) {
    this._type = dom.SVGTransform.SVG_TRANSFORM_SKEWX;
    this._angle = angle;
    this._matrix = (new dom.SVGMatrix).skewX(angle);
  },

  setSkewY: function(angle) {
    this._type = dom.SVGTransform.SVG_TRANSFORM_SKEWY;
    this._angle = angle;
    this._matrix = (new dom.SVGMatrix).skewY(angle);
  },

  // TODO what about the optional cx cy for rotate?
  toString: function() {
    var args = [];
    with (dom.SVGTransform)
      switch (this.type) {
        case SVG_TRANSFORM_MATRIX:    args = [this.matrix.a, this.matrix.b,
                                              this.matrix.c, this.matrix.d,
                                              this.matrix.e, this.matrix.f]; break;
        case SVG_TRANSFORM_TRANSLATE: args = [this.matrix.e, this.matrix.f]; break;
        case SVG_TRANSFORM_SCALE:     args = [this.matrix.a, this.matrix.d]; break;
        case SVG_TRANSFORM_ROTATE:    args = [this.angle];     break;
        case SVG_TRANSFORM_SKEWX:     args = [this.angle];     break;
        case SVG_TRANSFORM_SKEWY:     args = [this.angle];     break;
      }
    return dom.SVGTransform.typeToString[this.type] + '(' + args.join(' ') + ')';
  }
});

// SVGList (used for SVGStringList, SVGPointList, etc.)

dom.SVGList = function() { this._items = []; };

mico.extend(dom.SVGList.prototype, {
  get numberOfItems() { return this._items.length; },
  clear: function() { this._items.length = 0; },

  initialize: function(newItem) {
    this.clear();
    return this.appendItem(newItem);
  },

  getItem: function(index) { return this._items[index]; },
  insertItemBefore: function(newItem, index) { mico.TODO(); },
  replaceItem: function(newItem, index) { mico.TODO(); },
  removeItem: function(index) { mico.TODO(); },

  appendItem: function(newItem) {
    this._items.push(newItem);
    return newItem; 
  },

  toString: function() {
    return this._items.join(' ');
  }
});

// SVGPointList

dom.SVGPointList = function() { dom.SVGList.call(this); };
mico.extend(dom.SVGPointList.prototype, dom.SVGList.prototype);
mico.extend(dom.SVGPointList, {
  fromString: function(s) {
    var list = new dom.SVGPointList;
    var items = s.split(/(?:\s|,)+/);
    for (var i = 0; i < items.length - 1; i += 2)
      list.appendItem(dom.SVGPoint.fromString(items[i] + ',' + items[i + 1]));
    return list;
  }
});

// SVGNumberList

dom.SVGNumberList = function() { dom.SVGList.call(this); };
mico.extend(dom.SVGNumberList.prototype, dom.SVGList.prototype);
mico.extend(dom.SVGNumberList, {
  fromString: function(s) {
    var list = new dom.SVGNumberList;
    var items = s.split(/(?:\s|,)+/);
    for (var i = 0; i < items.length; i++)
      list.appendItem(dom.SVGNumber.fromString(items[i]));
    return list;
  }
});

// SVGLengthList

dom.SVGLengthList = function() { dom.SVGList.call(this); };
mico.extend(dom.SVGLengthList.prototype, dom.SVGList.prototype);
mico.extend(dom.SVGLengthList, {
  fromString: function(s) {
    var list = new dom.SVGLengthList;
    var items = s.split(/(?:\s|,)+/);
    for (var i = 0; i < items.length; i++)
      list.appendItem(dom.SVGLength.fromString(items[i]));
    return list;
  }
});

// SVGTransformList

dom.SVGTransformList = function() { dom.SVGList.call(this); };
mico.extend(dom.SVGTransformList.prototype, dom.SVGList.prototype);
mico.extend(dom.SVGTransformList, {
  fromString: function(s) {
    var list = new dom.SVGTransformList;
    var items = s.split(/\)\s*,*\s*/);
    for (var i = 0; i < items.length - 1; i++)
      list.appendItem(dom.SVGTransform.fromString(items[i] + ')'));
    return list;
  }
});

mico.extend(dom.SVGTransformList.prototype, {
  createSVGTransformFromMatrix: function(matrix) {
    var transform = new dom.SVGTransform;
    transform.setMatrix(matrix);
    return transform;
  },

  consolidate: function() {
    if (this.numberOfItems == 0)
      return null;
    if (this.numberOfItems == 1)
      return this.getItem(0);
    var matrix = new dom.SVGMatrix;
    for (var i = 0; i < this.numberOfItems; i++)
      matrix = this.getItem(i).matrix.multiply(matrix);
    this.clear();
    return this.appendItem(this.createSVGTransformFromMatrix(matrix));
  }
});

// SVGAnimated (used for SVGAnimatedBoolean, etc.)

dom.SVGAnimated = function() {};

dom.SVGAnimated.defineAnimated = function(classToAnimate, readonly) {
  var fromString = classToAnimate.fromString || classToAnimate;
  var animatedClass = function() {};
  mico.extend(animatedClass.prototype, dom.SVGAnimated.prototype);
  if (!readonly)
    animatedClass.prototype.__defineSetter__('baseVal',
      function(value) { this._baseVal = value; });
  animatedClass.fromString = function(s) {
    var object = new animatedClass;
    object._baseVal = fromString(s);
    return object;
  };
  return animatedClass;
};

mico.extend(dom.SVGAnimated.prototype, {
  get baseVal() { return this._baseVal; },
  // TODO this isn't correct...
  get animVal() { return this._baseVal; },
  toString: function() { return this._baseVal.toString(); }
});

// TODO will Boolean correctly parse the value strings? Probably not...
dom.SVGAnimatedBoolean = dom.SVGAnimated.defineAnimated(Boolean);
dom.SVGAnimatedNumber = dom.SVGAnimated.defineAnimated(dom.SVGNumber);
dom.SVGAnimatedEnumeration = dom.SVGAnimated.defineAnimated(parseInt);
dom.SVGAnimatedLength = dom.SVGAnimated.defineAnimated(dom.SVGLength, true);
dom.SVGAnimatedString = dom.SVGAnimated.defineAnimated(String);
dom.SVGAnimatedNumberList =
  dom.SVGAnimated.defineAnimated(dom.SVGNumberList, true);
dom.SVGAnimatedLengthList =
  dom.SVGAnimated.defineAnimated(dom.SVGLengthList, true);
dom.SVGAnimatedTransformList =
  dom.SVGAnimated.defineAnimated(dom.SVGTransformList, true);

// SVGLocatable

dom.SVGLocatable = function() {};
mico.extend(dom.SVGLocatable.prototype, {
  get nearestViewportElement() { mico.TODO(); },
  get farthestViewportElement() { mico.TODO(); },
  getBBox: function() { mico.TODO(); },
  getCTM: function() { mico.TODO(); },
  getScreenCTM: function() { mico.TODO(); },

  // FIXME this is broken, I'm pretty sure
  getTransformToElement: function(element) {
    var matrix;

    if (this === element)
      return new dom.SVGMatrix;
    if (this.parentNode && this.parentNode.getTransformToElement)
      matrix = this.parentNode.getTransformToElement(element);
    else
      matrix = new dom.SVGMatrix;

    if (this.hasAttribute('transform') &&
        this.transform.baseVal.numberOfItems) {
      var list = new dom.SVGTransformList;
      list._items = this.transform.baseVal._items.concat();
      // TODO which is right?
      matrix = matrix.multiply(list.consolidate().matrix.inverse());
      //matrix = list.consolidate().matrix.inverse().multiply(matrix);
    }

    return matrix;
  },
});

// dom.SVGTransformable

dom.SVGTransformable = function() { dom.SVGLocatable.call(this); };
mico.extend(dom.SVGTransformable.prototype, dom.SVGLocatable.prototype);
dom.Element.defineAttributes(dom.SVGTransformable,
  {name:'transform', type:dom.SVGAnimatedTransformList, readonly:true});

// SVGStylable

dom.SVGStylable = function() {};
dom.Element.defineAttributes(dom.SVGStylable,
  {name:'className', type:dom.SVGAnimatedString,   readonly:true, xmlName:'class'},
  {name:'style',     type:dom.CSSStyleDeclaration, readonly:true});
dom.SVGStylable.prototype.getPresentationAttribute = function(name) { mico.TODO(); };

// SVGAnimatedPoints

dom.SVGAnimatedPoints = function() {};
dom.Element.defineAttributes(dom.SVGAnimatedPoints,
  {name:'points',         type:dom.SVGPointList, readonly:true});

mico.extend(dom.SVGAnimatedPoints.prototype, {
  get animatedPoints() { return this.points; } // TODO not correct...
});

// SVGElement

dom.SVGElement = function() { dom.Element.call(this); };
mico.extend(dom.SVGElement.prototype, dom.Element.prototype);
dom.Element.factories['http://www.w3.org/2000/svg'] =
dom.SVGElement.factory = {};

dom.SVGElement.defineElement = function(name, parents) {
  (parents = parents || []).unshift(this);
  var element = function() {
    var _this = this;
    parents.forEach(function(parent) { parent.call(_this); });
  };
  element.attributeSpecs = {};
  parents.forEach(function(parent) {
    mico.extend(element.attributeSpecs, parent.attributeSpecs);
    mico.extend(element.prototype, parent.prototype);
  });
  dom.Element.defineAttributes.apply(dom.Element,
    [element].concat(Array.prototype.slice.call(arguments, 2)));
  if (name) {
    this.factory[name] = element;
    element.tagName = 'http://www.w3.org/2000/svg:' + name;
  }
  return element;
};

dom.Element.defineAttributes(dom.SVGElement, 'id', 'xmlbase');

mico.extend(dom.SVGElement.prototype, {
  get ownerSVGElement() {
    return dom.Node.findAncestor(this, function(p) {
      return p.nodeName == 'svg';
    });
  },
  get viewpointElement() { mico.TODO(); },
});

// SVGSVGElement

dom.SVGSVGElement = dom.SVGElement.defineElement('svg',
  [dom.SVGLocatable, dom.SVGStylable],
  {name:'x',      type:dom.SVGAnimatedLength, readonly:true, defaultValue:'0'},
  {name:'y',      type:dom.SVGAnimatedLength, readonly:true, defaultValue:'0'},
  {name:'width',  type:dom.SVGAnimatedLength, readonly:true, defaultValue:'100%'},
  {name:'height', type:dom.SVGAnimatedLength, readonly:true, defaultValue:'100%'});

mico.extend(dom.SVGSVGElement.prototype, {
  createSVGMatrix: function() { return new dom.SVGMatrix; },
  createSVGTransform: function() { return new dom.SVGTransform; }
});

// SVGDefsElement

dom.SVGDefsElement = dom.SVGElement.defineElement('defs',
  [dom.SVGTransformable, dom.SVGStylable]);

// SVGEllipseElement

dom.SVGEllipseElement = dom.SVGElement.defineElement('ellipse',
  [dom.SVGTransformable, dom.SVGStylable],
  {name:'cx', type:dom.SVGAnimatedLength, readonly:true, defaultValue:'0'},
  {name:'cy', type:dom.SVGAnimatedLength, readonly:true, defaultValue:'0'},
  {name:'rx', type:dom.SVGAnimatedLength, readonly:true, defaultValue:'0'},
  {name:'ry', type:dom.SVGAnimatedLength, readonly:true, defaultValue:'0'});

// SVGGElement

dom.SVGGElement = dom.SVGElement.defineElement('g',
  [dom.SVGTransformable, dom.SVGStylable]);

// SVGGradientElement

dom.SVGGradientElement = dom.SVGElement.defineElement(null,
  [dom.SVGStylable],
  {name:'gradientUnits',     type:dom.SVGAnimatedEnumeration,   readonly:true},
  {name:'gradientTransform', type:dom.SVGAnimatedTransformList, readonly:true},
  {name:'spreadMethod',      type:dom.SVGAnimatedEnumeration,   readonly:true});

mico.extend(dom.SVGGradientElement, {
  SVG_SPREADMETHOD_UNKNOWN: 0,
  SVG_SPREADMETHOD_PAD:     1,
  SVG_SPREADMETHOD_REFLECT: 2,
  SVG_SPREADMETHOD_REPEAT:  3
});

// SVGLinearGradientElement

dom.SVGLinearGradientElement = dom.SVGElement.defineElement('linearGradient',
  [dom.SVGGradientElement],
  {name:'x1', type:dom.SVGAnimatedLength, readonly:true, defaultValue:  '0%'},
  {name:'y1', type:dom.SVGAnimatedLength, readonly:true, defaultValue:  '0%'},
  {name:'x2', type:dom.SVGAnimatedLength, readonly:true, defaultValue:'100%'},
  {name:'y2', type:dom.SVGAnimatedLength, readonly:true, defaultValue:  '0%'});

// SVGRadialGradientElement

dom.SVGRadialGradientElement = dom.SVGElement.defineElement('radialGradient',
  [dom.SVGGradientElement],
  {name:'cx', type:dom.SVGAnimatedLength, readonly:true, defaultValue:'50%'},
  {name:'cy', type:dom.SVGAnimatedLength, readonly:true, defaultValue:'50%'},
  {name: 'r', type:dom.SVGAnimatedLength, readonly:true, defaultValue:'50%'},
  {name:'fx', type:dom.SVGAnimatedLength, readonly:true},
  {name:'fy', type:dom.SVGAnimatedLength, readonly:true});

// SVGPolygonElement

dom.SVGPolygonElement = dom.SVGElement.defineElement('polygon',
  [dom.SVGAnimatedPoints, dom.SVGTransformable, dom.SVGStylable]);

// SVGPolylineElement

dom.SVGPolylineElement = dom.SVGElement.defineElement('polyline',
  [dom.SVGAnimatedPoints, dom.SVGTransformable, dom.SVGStylable]);

// SVGRectElement

dom.SVGRectElement = dom.SVGElement.defineElement('rect',
  [dom.SVGTransformable, dom.SVGStylable],
  {name:     'x', type:dom.SVGAnimatedLength, readonly:true, defaultValue:'0'},
  {name:     'y', type:dom.SVGAnimatedLength, readonly:true, defaultValue:'0'},
  {name: 'width', type:dom.SVGAnimatedLength, readonly:true},
  {name:'height', type:dom.SVGAnimatedLength, readonly:true},
  {name:    'rx', type:dom.SVGAnimatedLength, readonly:true},
  {name:    'ry', type:dom.SVGAnimatedLength, readonly:true});

// SVGStopElement

dom.SVGStopElement = dom.SVGElement.defineElement('stop',
  [dom.SVGStylable],
  {name:'offset', type:dom.SVGAnimatedNumber, readonly:true});

// SVGTextContentElement

dom.SVGTextContentElement = dom.SVGElement.defineElement(null,
  [dom.SVGStylable],
  {name:'textLength',   type:dom.SVGAnimatedLength,      readonly:true},
  {name:'lengthAdjust', type:dom.SVGAnimatedEnumeration, readonly:true});

mico.extend(dom.SVGTextContentElement, {
  LENGTHADJUST_UNKNOWN:          0,
  LENGTHADJUST_SPACING:          1,
  LENGTHADJUST_SPACINGANDGLYPHS: 2
});

mico.extend(dom.SVGTextContentElement.prototype, {
  getNumberOfChars: function () { mico.TODO(); },
  getComputedTextLength: function() { mico.TODO(); },
  getSubStringLength: function(charnum, nchars) { mico.TODO(); },
  getStartPositionOfChar: function(charnum) { mico.TODO(); },
  getEndPositionOfChar: function(charnum) { mico.TODO(); },
  getExtentOfChar: function(charnum) { mico.TODO(); },
  getRotationOfChar: function(charnum) { mico.TODO(); },
  getCharNumAtPosition: function(pot) { mico.TODO(); },
  selectSubString: function(charnum, nchars) { mico.TODO(); },
});

// SVGTextPositioningElement

dom.SVGTextPositioningElement = dom.SVGElement.defineElement(null,
  [dom.SVGTextContentElement],
  {name:'x',      type:dom.SVGAnimatedLengthList, readonly:true},
  {name:'y',      type:dom.SVGAnimatedLengthList, readonly:true},
  {name:'dx',     type:dom.SVGAnimatedLengthList, readonly:true},
  {name:'dy',     type:dom.SVGAnimatedLengthList, readonly:true},
  {name:'rotate', type:dom.SVGAnimatedNumberList, readonly:true});

// SVGTextElement

dom.SVGTextElement = dom.SVGElement.defineElement('text',
  [dom.SVGTextPositioningElement, dom.SVGTransformable]);

// SVGTSpanElement

dom.SVGTSpanElement = dom.SVGElement.defineElement('tspan',
    [dom.SVGTextPositioningElement]);
