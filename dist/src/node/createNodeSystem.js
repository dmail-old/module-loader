"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNodeSystem = void 0;

var _isNodeBuiltinModule = require("./isNodeBuiltinModule.js");

var _vm = require("vm");

var _fetchModule = require("./fetchModule.js");

require("systemjs/dist/system.js");

var _getNamespaceToRegister = require("../getNamespaceToRegister.js");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const createNodeSystem = ({
  urlToFilename = url => url
}) => {
  const nodeSystem = new global.System.constructor();

  nodeSystem.instantiate = (url, parent) => {
    if ((0, _isNodeBuiltinModule.isNodeBuiltinModule)(url)) {
      return (0, _getNamespaceToRegister.getNamespaceToRegister)(() => {
        const nodeBuiltinModuleExports = require(url); // eslint-disable-line import/no-dynamic-require


        return _objectSpread({}, nodeBuiltinModuleExports, {
          default: nodeBuiltinModuleExports
        });
      });
    }

    return (0, _fetchModule.fetchModule)(url, parent).then(({
      status,
      reason,
      headers,
      body
    }) => {
      if (status < 200 || status >= 300) {
        return Promise.reject({
          status,
          reason,
          headers,
          body
        });
      } // This filename is very important because it allows the engine (like vscode) to be know
      // that the evluated file is in fact on the filesystem
      // (very important for debugging and sourcenap resolution)


      const filename = urlToFilename(url);
      const script = new _vm.Script(body, {
        filename
      });

      try {
        script.runInThisContext();
      } catch (error) {
        return Promise.reject({
          code: "MODULE_INSTANTIATE_ERROR",
          error,
          url,
          parent
        });
      }

      return nodeSystem.getRegister();
    });
  };

  return nodeSystem;
};

exports.createNodeSystem = createNodeSystem;
//# sourceMappingURL=createNodeSystem.js.map