"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.detect = void 0;

var _util = require("./util.js");

const userAgentToBrowser = userAgent => {
  if (/chromium/i.test(userAgent)) {
    return {
      name: "chrome",
      version: (0, _util.firstMatch)(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i, userAgent) || (0, _util.userAgentToVersion)(userAgent)
    };
  }

  if (/chrome|crios|crmo/i.test(userAgent)) {
    return {
      name: "chrome",
      version: (0, _util.firstMatch)(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, userAgent)
    };
  }

  return null;
};

const detect = () => userAgentToBrowser(window.navigator.userAgent);

exports.detect = detect;
//# sourceMappingURL=chrome.js.map