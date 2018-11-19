"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.detect = void 0;

var _util = require("./util.js");

const userAgentToBrowser = userAgent => {
  if (/msie|trident/i.test(userAgent)) {
    return {
      name: "ie",
      version: (0, _util.firstMatch)(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, userAgent)
    };
  }

  return null;
};

const detect = () => userAgentToBrowser(window.navigator.userAgent);

exports.detect = detect;
//# sourceMappingURL=ie.js.map