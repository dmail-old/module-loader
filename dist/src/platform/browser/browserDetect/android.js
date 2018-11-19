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
  if (/(android)/i.test(userAgent)) {
    return {
      name: "android",
      version: (0, _util.firstMatch)(/Android (\d+(\.?_?\d+)+)/i, appVersion)
    };
  }

  return null;
};

const detect = () => navigatorToBrowser(window.navigator);

exports.detect = detect;
//# sourceMappingURL=android.js.map