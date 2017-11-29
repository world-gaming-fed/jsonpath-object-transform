/*jshint evil:true*/
/*global module, require, define*/

(function (root, factory) {
  'use strict';

  // AMD
  if (typeof define === 'function' && define.amd) {
    define('jsonpathObjectTransform', ['JSONPath'], function(jsonPath) {
      return (root.jsonpathObjectTransform = factory(jsonPath));
    });
  }

  // Node
  else if (typeof exports === 'object') {
    module.exports = factory(require('JSONPath'));
  }

  // Browser global
  else {
    root.jsonpathObjectTransform = factory(root.jsonPath);
  }
}(this, function(jsonPath) {
  'use strict';

  function updatePointer(pointer, key) {
    if (key === undefined) return pointer
    
    if (typeof key === 'number') {
      pointer += '['+key+']'
    }
    else {
      if (pointer && pointer.length) {
        pointer += '.'
      }
      else {
        pointer = ''
      }

      pointer += key
    }

    return pointer
  }

  /**
   * Step through data object and apply path transforms.
   *
   * @param {object} data
   * @param {object} path
   * @param {object} result
   * @param {string} key
   */
  function walk(data, path, result, key, pointer) {
    var fn;

    switch (type(path)) {
      case 'string':
        pointer = updatePointer(pointer, key)
        fn = seekSingle;
        break;

      case 'array':
        pointer = updatePointer(pointer, key)
        fn = seekArray;
        break;

      case 'object':
        pointer = updatePointer(pointer, key)
        fn = seekObject;
        break;

      case 'function':
        pointer = updatePointer(pointer, key)
        fn = path;
        break;
    }

    if (fn) {
      fn(data, path, result, key, pointer);
    }
  }

  /**
   * Determine type of object.
   *
   * @param {object} obj
   * @returns {string}
   */
  function type(obj) {
    return Array.isArray(obj) ? 'array' : typeof obj;
  }

  /**
   * Get single property from data object.
   *
   * @param {object} data
   * @param {string} pathStr
   * @param {object} result
   * @param {string} key
   */
  function seekSingle(data, pathStr, result, key) {
    if(pathStr.indexOf('$') < 0){
      result[key] = pathStr;
    }else{
      var seek = jsonPath.eval(data, pathStr) || [];

      if (seek.length) {
        result[key] = seek[0];
      }
    }
  }

  /**
   * Get array of properties from data object.
   *
   * @param {object} data
   * @param {array} pathArr
   * @param {object} result
   * @param {string} key
   */
  function seekArray(data, pathArr, result, key, pointer) {
    var subpath = pathArr[1];
    var path = pathArr[0];
    var seek = jsonPath.eval(data, path) || [];

    if (seek.length && subpath) {
      result = result[key] = [];

      seek[0].forEach(function(item, index) {
        walk(item, subpath, result, index, pointer);
      });
    } else {
      result[key] = seek;
    }
  }

  /**
   * Get object property from data object.
   *
   * @param {object} data
   * @param {object} pathObj
   * @param {object} result
   * @param {string} key
   */
  function seekObject(data, pathObj, result, key, pointer) {
    if (typeof key !== 'undefined') {
      result = result[key] = {};
    }

    Object.keys(pathObj).forEach(function(name) {
      walk(data, pathObj[name], result, name, pointer);
    });
  }

  /**
   * @module jsonpath-object-transform
   * @param {object} data
   * @param {object} path
   * @returns {object}
   */
  return function(data, path) {
    var result = {};

    walk(data, path, result, undefined, '');

    return result;
  };

}));
