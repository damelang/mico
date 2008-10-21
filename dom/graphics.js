/* This file is part of the Mico project, available under the MIT license:
 *
 *    http://www.opensource.org/licenses/mit-license.php
 */

mico.require('dom.core');

dom.graphics = {
  queue: [],
  renderers: {},

  render: function(element) {
    var renderer = this.renderers[element.constructor.tagName];
    renderer = renderer || this.renderers[null];
    return renderer && renderer(element);
  },

  update: function() {
    // TODO get rid of multiple occurances of elements in queue?
    while (this.queue.length)
      this.render(this.queue.pop());
  }
};

mico.around(dom.Attr.prototype, 'value=',
function(func, args) {
  func.apply(this, args);
  if (this.ownerElement && this.ownerElement._graphics)
    dom.graphics.queue.push(this.ownerElement);
});

// FIXME I'm uneasy about depending on DOM implementation-specific details here
mico.around(dom.Element.prototype,
['removeChild', 'removeAttributeNode', 'removeAttributeNS'],
function(func, args) {
  if (this._graphics)
    dom.graphics.queue.push(this);
  return func.apply(this, args);
});

mico.around(dom.Element.prototype, ['deepClone', 'cloneNode'],
function(func, args) {
  var _graphics = this._graphics;
  delete this._graphics;
  var clone = func.apply(this, args);
  _graphics && (this._graphics = _graphics);
  return clone;
});
