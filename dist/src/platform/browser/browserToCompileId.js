"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.browserToCompileId = void 0;

var _versionCompare = require("@dmail/project-structure-compile-babel/src/versionCompare.js");

const browserToCompileId = ({
  name,
  version
}, compileMap) => {
  return Object.keys(compileMap).find(id => {
    const {
      compatMap
    } = compileMap[id];

    if (name in compatMap === false) {
      return false;
    }

    const versionForGroup = compatMap[name];
    return (0, _versionCompare.versionIsBelowOrEqual)(versionForGroup, version);
  });
};

exports.browserToCompileId = browserToCompileId;
//# sourceMappingURL=browserToCompileId.js.map