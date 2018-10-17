"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSystemLocation = void 0;

const getSystemLocation = () => {
  return require.resolve("systemjs/dist/system.js");
};

exports.getSystemLocation = getSystemLocation;
//# sourceMappingURL=getSystemLocation.js.map