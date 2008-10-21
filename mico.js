/* This file is part of the Mico project, available under the MIT license:
 *
 *    http://www.opensource.org/licenses/mit-license.php
 */

var mico = {
  TODO: function() {
    var e = new Error;
    e.message = 'Not implemented yet:\n' + e.stack;
    throw e;
  },

  // FIXME In some JS environs (FF 3.0?) we have to delete the getter/setter
  // before we overwrite it (I think).
  extend: function(destination, source) {
    for (var property in source) {
      var getter = source.__lookupGetter__(property);
      if (getter)
        destination.__defineGetter__(property, getter);
      var setter = source.__lookupSetter__(property);
      if (setter)
        destination.__defineSetter__(property, setter);
      if (!getter && !setter)
        destination[property] = source[property];
    }
    return destination;
  },

  // TODO needs testing (and likely some fixing!)
  deepClone: function(original /*, blacklist */) {
    var clone;
    var blacklist = Array.prototype.slice.call(arguments, 1);

    if (original && typeof original == 'object') {
      if (original instanceof Array) {
        clone = new Array(original.length);
        for (var i = 0; i < original.length; i++)
          clone[i] = (original[i] && original[i].deepClone) ?
                     original[i].deepClone() : this.deepClone(original[i]);
      }
      else {
        clone = {};
        clone.constructor = original.constructor;
        for (var p in original) {
          if (blacklist.indexOf(p) != -1)
            continue;
          var getter = original.__lookupGetter__(p);
          if (getter)
            clone.__defineGetter__(p, getter);
          var setter = original.__lookupSetter__(p);
          if (setter)
            clone.__defineSetter__(p, setter);
          if (!getter && !setter)
            clone[p] = (original[p] && original[p].deepClone) ?
                       original[p].deepClone() : this.deepClone(original[p]);
        }
      }
    } else
      clone = original;

    return clone;
  },

  around: function(prototype, functions, advice) {
    [].concat(functions).forEach(function(f) {
      if (f[0] === '=') {
        f = f.slice(1);
        var proceed = prototype.__lookupGetter__(f);
        prototype.__defineGetter__(f, function() {
          return advice.call(this, proceed, arguments);
        });
      } else if (f[f.length - 1] === '=') {
        f = f.slice(0, f.length - 1);
        var proceed = prototype.__lookupSetter__(f);
        prototype.__defineSetter__(f, function() {
          return advice.call(this, proceed, arguments);
        });
      } else {
        var proceed = prototype[f];
        prototype[f] = function() {
          return advice.call(this, proceed, arguments);
        }
      }
    });
  },

  _loadedPackages: {},
  packageLocations: {},

  require: function() {
    Array.prototype.slice.call(arguments).forEach(function(name) {
      if (mico._loadedPackages[name])
        return;

      var location = mico.packageLocations[name];
      if (location) {
        if (!system.dlload(location) && !system.load(location))
          throw 'Unable to find package: ' + name + ' at location: ' + location;
      }
      else {
        // TODO add the concept of paths (or repositories) here
        // FIXME we're not platform independent here
        var absName = name.replace('.', '/');
        if (!system.dlload(absName + '/' + system.engine) &&
            !system.load(absName + '.js'))
          throw 'Unable to find package: ' + name;
      }

      mico._loadedPackages[name] = true;
    });
  }
};
