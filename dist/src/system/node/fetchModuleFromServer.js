"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchModuleFromServer = void 0;

var _https = _interopRequireDefault(require("https"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_https.default.globalAgent.options.rejectUnauthorized = false;

const getHeaderMapFromResponse = response => {
  const headerMap = {};
  response.headers.forEach((value, name) => {
    headerMap[name] = value;
  });
  return headerMap;
};

const fetchModuleFromServer = async (url, parent) => {
  const response = await (0, _nodeFetch.default)(url, {
    headers: {
      "x-module-referer": parent || url
    }
  });
  const text = await response.text();
  return {
    status: response.status,
    reason: response.statusText,
    headers: getHeaderMapFromResponse(response),
    body: text
  };
};

exports.fetchModuleFromServer = fetchModuleFromServer;
//# sourceMappingURL=fetchModuleFromServer.js.map