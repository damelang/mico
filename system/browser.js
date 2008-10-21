/* This file is part of the Mico project, available under the MIT license:
 *
 *    http://www.opensource.org/licenses/mit-license.php
 */

var system = {
  engine: 'browser',

  // TODO this goes away after open() gets implemented
  print: function(s) { console.log(s); },

  open: function(filename, action) {
    // TODO maybe do an XHR here?
  },

  dlload: function(filename) {},

  load: function(filename) {
    // TODO use script tag trick?
  }
};
