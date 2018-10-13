"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sourceMappingURLMap = void 0;

// here we can do stuff like window.System.prototype.instantiate = stuff
const sourceMappingURLMap = (source, callback) => {
  const sourceMappingUrlRegExp = /\/\/# ?sourceMappingURL=([^\s'"]+)/g;
  let lastSourceMappingUrl;
  let matchSourceMappingUrl;

  while (matchSourceMappingUrl = sourceMappingUrlRegExp.exec(source)) {
    lastSourceMappingUrl = matchSourceMappingUrl;
  }

  if (lastSourceMappingUrl) {
    const index = lastSourceMappingUrl.index;
    const before = source.slice(0, index);
    const after = source.slice(index);
    const mappedAfter = after.replace(sourceMappingUrlRegExp, (match, firstGroup) => {
      return `${"//#"} sourceMappingURL=${callback(firstGroup)}`;
    });
    return `${before}${mappedAfter}`;
  }

  return source;
};

exports.sourceMappingURLMap = sourceMappingURLMap;
//# sourceMappingURL=sourceMappingURLMap.js.map