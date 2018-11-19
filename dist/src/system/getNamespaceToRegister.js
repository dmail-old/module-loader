"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNamespaceToRegister = void 0;

const getNamespaceToRegister = getNamespace => {
  return [[], _export => {
    return {
      execute: () => {
        _export(getNamespace());
      }
    };
  }];
};

exports.getNamespaceToRegister = getNamespaceToRegister;
//# sourceMappingURL=getNamespaceToRegister.js.map