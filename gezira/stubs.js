/* This file is part of the Mico project, available under the MIT license:
 *
 *    http://www.opensource.org/licenses/mit-license.php
 */

// FIXME this file is out of date

var gezira = {};

(function(stub) {
  ['paint', 'free', 'Object', 'Parent', 'Background', 'ColorOver', 'Composite',
  'Group', 'Lines', 'Bezier3s', 'Translation', 'Scale',
  'Group.prototype.children', 'Parent.prototype.child'].forEach(function(n) {
    eval('gezira.' + n + ' = stub;');
  });
})(function(){});
