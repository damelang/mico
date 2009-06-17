/* This file is part of the Mico project, available under the MIT license:
 *
 *    http://www.opensource.org/licenses/mit-license.php
 */

mico.require('dom.core');

// TODO deal with case-sensitivity for HTML tagnames and such

// HTMLDocument

dom.HTMLDocument = function () { dom.Document.call(this); };
mico.extend(dom.HTMLDocument.prototype, dom.Document.prototype);

mico.extend(dom.HTMLDocument.prototype, {
  get title() { return this._title; },
  set title(value) { this._title = value; },
  get referrer() { return this._referrer; },
  get domain() { return this._domain; },
  get URL() { return this._URL; },
  get body() { mico.TODO(); },
  set body(value) { mico.TODO(); },
  get images() { mico.TODO(); },
  get applets() { mico.TODO(); },
  get links() { mico.TODO(); },
  get forms() { mico.TODO(); },
  get anchors() { mico.TODO(); },
  get cookie() { return this._cookie; },
  set cookie(value) { this._cookie = value; },
  open: function() { mico.TODO(); },
  close: function() { mico.TODO(); },
  write: function(text) { mico.TODO(); },
  writeln: function(text) { mico.TODO(); },
  getElementsByName: function(elementName) { mico.TODO(); },

  getElementById: function(id) {
    return dom.Node.find(this.documentElement, function(node) {
      // TODO case-sensitivity?
      return (node.nodeType == dom.Node.ELEMENT_NODE &&
              node.getAttribute('id') == id);
    });
  }
});

// HTMLElement

dom.HTMLElement = function() {
  dom.Element.call(this);
  // TODO we should actually implement the CSS object, and this should be
  // an attribute node, see interface ElementCSSInlineStyle, which HTMLElements
  // should mix in.
  this.style = {};
};
mico.extend(dom.HTMLElement.prototype, dom.Element.prototype);
dom.Element.factories['http://www.w3.org/1999/xhtml'] =
dom.HTMLElement.factory = {};

dom.HTMLElement.defineElement = function(name) {
  var element = function() { dom.HTMLElement.call(this); };
  mico.extend(element.prototype, dom.HTMLElement.prototype);
  element.attributeSpecs = {};
  mico.extend(element.attributeSpecs, dom.HTMLElement.attributeSpecs);
  dom.Element.defineAttributes.apply(dom.Element,
    [element].concat(Array.prototype.slice.call(arguments, 1)));
  this.factory[name] = element;
  element.tagName = 'http://www.w3.org/1999/xhtml:' + name;
  return element;
};

dom.Element.defineAttributes(dom.HTMLElement, 'id', 'title', 'lang', 'dir',
  {name:'className', xmlName:'class'});

// TODO should define tagName for each (using defineElement)
['sub', 'sup', 'bdo', 'tt', 'i', 'b', 'u', 's', 'strike', 'big',
 'small', 'em', 'strong', 'dfn', 'code', 'samp', 'kbd', 'var', 'cite',
 'acronym', 'abbr', 'dd', 'dt', 'noframes', 'noscript', 'address', 'center'].
 forEach(function(name) { dom.HTMLElement.factory[name] = dom.HTMLElement; });

dom.HTMLSpanElement = dom.HTMLElement.defineElement('span');
/* FIXME many ugly hacks here */
mico.extend(dom.HTMLSpanElement.prototype, {
    _metrics: function(text) {
      if (!gezira)
        return [10, 10];
      var sumx = 0;
      var sumy = 0;
      for (var i = 0; i < text.length; i++) {
        var metrics = gezira._glyphserver.metrics(text[i]);
        sumx += metrics[0];
        sumy += metrics[1];
      }
      return [sumx, sumy];
    },

    get offsetWidth() {
      return this._metrics(this.firstChild.data)[0];
    },
    get offsetHeight() {
      return this._metrics(this.firstChild.data)[1];
    }
});

dom.HTMLHtmlElement = dom.HTMLElement.defineElement('html', 'version');
dom.HTMLHeadElement = dom.HTMLElement.defineElement('head', 'profile');
dom.HTMLBodyElement = dom.HTMLElement.defineElement('body',
  'aLink', 'background', 'bgColor', 'link', 'text', 'vLink');
dom.HTMLDivElement = dom.HTMLElement.defineElement('div', 'align');
