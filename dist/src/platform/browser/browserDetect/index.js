"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.detect = void 0;

var _android = require("./android.js");

var _ie = require("./ie.js");

var _opera = require("./opera.js");

var _edge = require("./edge.js");

var _firefox = require("./firefox.js");

var _chrome = require("./chrome.js");

var _safari = require("./safari.js");

var _electron = require("./electron.js");

var _ios = require("./ios.js");

// https://github.com/Ahmdrza/detect-browser/blob/26254f85cf92795655a983bfd759d85f3de850c6/detect-browser.js#L1
// https://github.com/lancedikson/bowser/blob/master/src/parser-browsers.js#L1
const detectorCompose = detectors => () => {
  let i = 0;

  while (i < detectors.length) {
    const detector = detectors[i];
    i++;
    const result = detector();

    if (result) {
      return result;
    }
  }

  return null;
};

const detector = detectorCompose([_opera.detect, _ie.detect, _edge.detect, _firefox.detect, _chrome.detect, _safari.detect, _electron.detect, _ios.detect, _android.detect]);

const normalizeName = name => {
  return name.toLowerCase();
};

const normalizeVersion = version => {
  if (version.indexOf(".") > -1) {
    const parts = version.split("."); // remove extraneous .

    return parts.slice(0, 3).join(".");
  }

  if (version.indexOf("_") > -1) {
    const parts = version.split("_"); // remove extraneous _

    return parts.slice(0, 3).join("_");
  }

  return version;
};

const detect = () => {
  const {
    name = "other",
    version = "unknown"
  } = detector() || {};
  return {
    name: normalizeName(name),
    version: normalizeVersion(version)
  };
};

exports.detect = detect;
//# sourceMappingURL=index.js.map