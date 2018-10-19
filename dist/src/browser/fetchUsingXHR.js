"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchUsingXHR = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders#Example
const getHeadersFromXHR = xhr => {
  const headersString = xhr.getAllResponseHeaders();

  if (headersString === "") {
    return {};
  }

  const lines = headersString.trim().split(/[\r\n]+/);
  const headerMap = {};
  lines.forEach(line => {
    const parts = line.split(": ");
    const name = parts.shift();
    const value = parts.join(": ");
    headerMap[name.toLowserCase()] = value;
  });
  return headerMap;
};

const normalizeXhr = xhr => {
  return {
    status: xhr.status,
    reason: xhr.statusText,
    headers: getHeadersFromXHR(xhr),
    body: xhr.responseText
  };
};

const fetchUsingXHR = url => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.ontimeout = () => {
      reject({
        name: "REQUEST_TIMEOUT_ERROR"
      });
    };

    xhr.onerror = error => {
      reject(error);
    };

    xhr.onload = () => {
      if (xhr.status === 0) {
        resolve(_objectSpread({}, normalizeXhr(xhr), {
          status: 200
        }));
        return;
      }

      resolve(_objectSpread({}, normalizeXhr(xhr)));
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) {
        return;
      } // in Chrome on file:/// URLs, status is 0


      if (xhr.status === 0) {
        if (xhr.responseText) {
          xhr.onload();
        }

        return;
      }

      resolve(normalizeXhr(xhr));
    };

    xhr.open("GET", url, true);
    xhr.send(null);
  });
};

exports.fetchUsingXHR = fetchUsingXHR;
//# sourceMappingURL=fetchUsingXHR.js.map