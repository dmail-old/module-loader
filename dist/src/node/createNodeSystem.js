"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNodeSystem = void 0;

var _isNodeBuiltinModule = require("./isNodeBuiltinModule.js");

var _vm = require("vm");

var _fetchModule = require("./fetchModule.js");

require("systemjs/dist/system.js");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const createNodeSystem = ({
  localRoot
} = {}) => {
  return Promise.resolve().then(() => {
    const nodeSystem = new global.System.constructor();

    nodeSystem.instantiate = (url, parent) => {
      if ((0, _isNodeBuiltinModule.isNodeBuiltinModule)(url)) {
        const nodeBuiltinModuleExports = require(url); // eslint-disable-line import/no-dynamic-require


        const bindings = _objectSpread({}, nodeBuiltinModuleExports, {
          default: nodeBuiltinModuleExports
        });

        const instantiateArgs = [[], _export => {
          return {
            execute: () => {
              _export(bindings);
            }
          };
        }];
        return Promise.resolve(instantiateArgs);
      }

      return (0, _fetchModule.fetchModule)(url, parent).then(({
        source,
        location
      }) => {
        // when System.import evaluates the code it has fetched
        // it uses require('vm').runInThisContext(code, { filename }).
        // This filename is very important because it allows the engine to be able
        // to resolve source map location inside evaluated code like 
        // and also to know where the file is to resolve other file when evaluating code
        const filename = `${localRoot}/${location}`;
        const script = new _vm.Script(source, {
          filename
        });
        script.runInThisContext();
      }).then(() => nodeSystem.getRegister());
    };

    return nodeSystem;
  });
};

exports.createNodeSystem = createNodeSystem;
//# sourceMappingURL=createNodeSystem.js.map