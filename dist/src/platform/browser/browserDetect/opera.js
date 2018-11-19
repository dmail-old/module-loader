"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.detect = void 0;

var _util = require("./util.js");

const userAgentToBrowser = userAgent => {
  // opera below 13
  if (/opera/i.test(userAgent)) {
    return {
      name: "opera",
      version: (0, _util.userAgentToVersion)(userAgent) || (0, _util.firstMatch)(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i, userAgent)
    };
  } // opera above 13


  if (/opr\/|opios/i.test(userAgent)) {
    return {
      name: "opera",
      version: (0, _util.firstMatch)(/(?:opr|opios)[\s/](\S+)/i, userAgent) || (0, _util.userAgentToVersion)(userAgent)
    };
  }

  return null;
};

const detect = () => userAgentToBrowser(window.navigator.userAgent);

exports.detect = detect;
//# sourceMappingURL=opera.js.map