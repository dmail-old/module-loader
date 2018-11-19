"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchModule = void 0;

var _fetchModuleFromFileSystem = require("./fetchModuleFromFileSystem.js");

var _fetchModuleFromServer = require("./fetchModuleFromServer.js");

const protocolIsFile = url => {
  return url.indexOf("file:") === 0;
};

const protocolIsHttpOrHttps = url => {
  return url.indexOf("http:") === 0 || url.indexOf("https:") === 0;
};

const fetchModule = (url, parent) => {
  if (protocolIsFile(url)) {
    return (0, _fetchModuleFromFileSystem.fetchModuleFromFileSystem)(url, parent);
  }

  if (protocolIsHttpOrHttps(url)) {
    return (0, _fetchModuleFromServer.fetchModuleFromServer)(url, parent);
  }

  throw new Error(`unsupported protocol for module ${url}`);
};

exports.fetchModule = fetchModule;
//# sourceMappingURL=fetchModule.js.map