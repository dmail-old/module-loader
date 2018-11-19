"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchModuleFromFileSystem = void 0;

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const isWindows = typeof process !== "undefined" && typeof process.platform === "string" && process.platform.match(/^win/);

const fileUrlToPath = fileUrl => {
  if (fileUrl.substr(0, 7) !== "file://") {
    throw new RangeError(`${fileUrl} is not a valid file url`);
  }

  if (isWindows) {
    return fileUrl.substr(8).replace(/\\/g, "/");
  }

  return fileUrl.substr(7);
};

const fetchModuleFromFileSystem = key => {
  const filePath = fileUrlToPath(key);
  return new Promise((resolve, reject) => {
    _fs.default.readFile(filePath, (error, buffer) => {
      if (error) {
        reject(error);
      } else {
        resolve(String(buffer));
      }
    });
  }).then(source => {
    return {
      status: 200,
      reason: "",
      headers: {},
      body: source
    };
  });
};

exports.fetchModuleFromFileSystem = fetchModuleFromFileSystem;
//# sourceMappingURL=fetchModuleFromFileSystem.js.map