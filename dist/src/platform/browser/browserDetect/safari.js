"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.detect = void 0;

var _util = require("./util.js");

const userAgentToBrowser = userAgent => {
  if (/safari|applewebkit/i.test(userAgent)) {
    return {
      name: "safari",
      version: (0, _util.userAgentToVersion)(userAgent)
    };
  }

  return null;
};

const detect = () => userAgentToBrowser(window.navigator.userAgent);

exports.detect = detect;
//# sourceMappingURL=safari.js.map