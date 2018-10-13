"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNodeBuiltinModule = void 0;

var _module = _interopRequireDefault(require("module"));

var _repl = _interopRequireDefault(require("repl"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const isNodeBuiltinModule = moduleName => {
  // https://nodejs.org/api/modules.html#modules_module_builtinmodules
  if ("builtinModules" in _module.default) {
    return _module.default.builtinModules.includes(moduleName);
  } // https://stackoverflow.com/a/35825896


  return _repl.default._builtinLibs.includes(moduleName);
};

exports.isNodeBuiltinModule = isNodeBuiltinModule;
//# sourceMappingURL=isNodeBuiltinModule.js.map