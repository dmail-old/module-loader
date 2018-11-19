"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.detect = void 0;

var _util = require("./util.js");

const navigatorToBrowser = ({
  userAgent,
  appVersion
}) => {
  if (/iPhone;/.test(userAgent)) {
    return {
      name: "ios",
      version: (0, _util.firstMatch)(/OS (\d+(\.?_?\d+)+)/i, appVersion)
    };
  }

  if (/iPad;/.test(userAgent)) {
    return {
      name: "ios",
      version: (0, _util.firstMatch)(/OS (\d+(\.?_?\d+)+)/i, appVersion)
    };
  }

  return null;
};

const detect = () => navigatorToBrowser(window.navigator);

exports.detect = detect;
//# sourceMappingURL=ios.js.map