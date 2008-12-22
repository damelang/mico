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
    // TODO get rid of multiple occurances of the same element in queue?
    while (this.queue.length)
      this.render(this.queue.pop());
  }
};

mico.around(dom.Attr.prototype, 'value=',
function(proceed, args) {
  proceed.apply(this, args);
  if (this.ownerElement && this.ownerElement._graphics)
    dom.graphics.queue.push(this.ownerElement);
});

// FIXME I'm uneasy about depending on DOM implementation-specific details here
mico.around(dom.Element.prototype,
['removeChild', 'removeAttributeNode', 'removeAttributeNS'],
function(proceed, args) {
  if (this._graphics)
    dom.graphics.queue.push(this);
  return proceed.apply(this, args);
});

mico.around(dom.Element.prototype, ['deepClone', 'cloneNode'],
function(proceed, args) {
  var _graphics = this._graphics;
  delete this._graphics;
  var clone = proceed.apply(this, args);
  _graphics && (this._graphics = _graphics);
  return clone;
});
