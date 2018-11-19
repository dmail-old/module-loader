"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.valueInstall = void 0;

const valueInstall = (object, name, value) => {
  const has = name in object;
  const previous = object[name];
  object[name] = value;
  return () => {
    if (has) {
      object[name] = previous;
    } else {
      delete object[name];
    }
  };
};

exports.valueInstall = valueInstall;
//# sourceMappingURL=valueInstall.js.map