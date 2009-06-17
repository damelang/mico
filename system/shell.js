/* This file is part of the Mico project, available under the MIT license:
 *
 *    http://www.opensource.org/licenses/mit-license.php
 */

var system = {
  engine: 'shell',

  // TODO this goes away after open() gets implemented
  print: function(s) { print(s); },

  open: function(filename, action) {
    // TODO readFile() or some common shell API?
  },

  dlload: function(filename) {},

  load: function() {
    Array.prototype.forEach.call(arguments, function (filename) {
      load(filename);
    });
    return true;
  }
};
