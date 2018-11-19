"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userAgentToVersion = exports.secondMatch = exports.firstMatch = void 0;

const firstMatch = (regexp, string) => {
  const match = string.match(regexp);
  return match && match.length > 0 ? match[1] || undefined : undefined;
};

exports.firstMatch = firstMatch;

const secondMatch = (regexp, string) => {
  const match = string.match(regexp);
  return match && match.length > 1 ? match[2] || undefined : undefined;
};

exports.secondMatch = secondMatch;

const userAgentToVersion = userAgent => {
  return firstMatch(/version\/(\d+(\.?_?\d+)+)/i, userAgent) || undefined;
};

exports.userAgentToVersion = userAgentToVersion;
//# sourceMappingURL=util.js.map