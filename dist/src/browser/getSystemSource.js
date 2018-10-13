"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSystemSource = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _getSystemLocation = require("./getSystemLocation.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let systemSourcePromise;

const getSystemSource = () => {
  if (systemSourcePromise) {
    return systemSourcePromise;
  }

  systemSourcePromise = Promise.resolve().then(() => (0, _getSystemLocation.getSystemLocation)()).then(systemLocation => {
    return new Promise((resolve, reject) => {
      _fs.default.readFile(systemLocation, (error, buffer) => {
        if (error) {
          reject(error);
        } else {
          resolve(buffer.toString());
        }
      });
    });
  });
  return systemSourcePromise;
};

exports.getSystemSource = getSystemSource;
//# sourceMappingURL=getSystemSource.js.map