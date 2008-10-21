/* This file is part of the Mico project, available under the MIT license:
 *
 *    http://www.opensource.org/licenses/mit-license.php
 */

mico.require('dom.core');

// FIXME this is a temporary hack, we need to properly implement
// the event prototypes soon.
dom.MouseEvent = function() {};
mico.extend(dom.MouseEvent.prototype, {
  get currentTarget() { return this._currentTarget; },
  get shiftKey() { return this._shiftKey; },
  get type() { return this._type; },
  get clientX() { return this._clientX; },
  get clientY() { return this._clientY; },
  stopPropagation: function() { this._propagationStopped = true; }
});

dom.EventTarget = {
  // TODO go over the spec again
  addEventListener: function(type, listener, useCapture) {
    this._eventListeners = this._eventListeners || {};
    this._eventListeners[type] = this._eventListeners[type] || []; 
    this._eventListeners[type].push(listener);
  },

  // TODO go over the spec again
  removeEventListener: function(type, listener, useCapture) {
    /*
    this._eventListeners = this._eventListeners || {};
    if (this._eventListeners[type] && this._eventListeners[type].indexOf(listener)
    */
    mico.TODO();
  },

  dispatchEvent: function(evt) {
    var listeners = this._eventListeners && this._eventListeners[evt.type];
    evt._currentTarget = this;

    if (listeners)
      listeners.forEach(function(l) { l.handleEvent(evt); });

    this.childNodes._nodes.forEach(function(c) {
      if (!evt._propagationStopped)
        c.dispatchEvent(evt);
    });
  },
};

/* TODO we really should only have to put this in Node, but because we use
 * "copy" inheritance, we have to mix EventTarget into all the children in
 * the clone family.
 */
mico.extend(dom.Node.prototype,          dom.EventTarget);
mico.extend(dom.Attr.prototype,          dom.EventTarget);
mico.extend(dom.Element.prototype,       dom.EventTarget);
mico.extend(dom.CharacterData.prototype, dom.EventTarget);
mico.extend(dom.Text.prototype,          dom.EventTarget);
mico.extend(dom.CDATASection.prototype,  dom.EventTarget);
mico.extend(dom.Document.prototype,      dom.EventTarget);

/* TODO the below needs to be done to all in the Node clone family,
 * as we do with mixing in EventTarget above. Perhaps we should use
 * "true" JS inheritance for the Node clone family, and copy
 * inheritance for the rest (see HTML and SVG elements) ?
 */
mico.around(dom.Element.prototype,
['deepClone', 'cloneNode'],
function(proceed, args) {
  var listeners = this._eventListeners;
  delete this._eventListeners;
  var clone = proceed.apply(this, args);
  listeners && (this._eventListeners = listeners);
  return clone;
});
