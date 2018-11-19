"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.detect = void 0;

var _util = require("./util.js");

const userAgentToBrowser = userAgent => {
  if (/edg([ea]|ios)/i.test(userAgent)) {
    return {
      name: "edge",
      version: (0, _util.secondMatch)(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, userAgent)
    };
  }

  return null;
};

const detect = () => userAgentToBrowser(window.navigator.userAgent);

exports.detect = detect;
//# sourceMappingURL=edge.js.map