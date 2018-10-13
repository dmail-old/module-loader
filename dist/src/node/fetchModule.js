"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchModule = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _https = _interopRequireDefault(require("https"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_https.default.globalAgent.options.rejectUnauthorized = false;
const isWindows = typeof process !== "undefined" && typeof process.platform === "string" && process.platform.match(/^win/);
const nodeVersion = process.version.slice(1);

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
  if (key.indexOf("file:") === 0) {
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
        source
      };
    });
  }

  return undefined;
};

const fetchModuleFromServer = key => {
  if (key.indexOf("http:") === 0 || key.indexOf("https:") === 0) {
    return (0, _nodeFetch.default)(key, {
      headers: {
        "user-agent": `node/${nodeVersion}`
      }
    }).then(response => response.text().then(source => {
      return {
        location: response.headers.get("x-location"),
        source
      };
    }));
  }

  return undefined;
};

const fetchModule = key => {
  return Promise.resolve(fetchModuleFromFileSystem(key)).then(data => {
    return data ? data : Promise.resolve(fetchModuleFromServer(key)).then(data => {
      if (data) {
        return data;
      }

      throw new Error(`unsupported protocol for module ${key}`);
    });
  });
};

exports.fetchModule = fetchModule;
//# sourceMappingURL=fetchModule.js.map