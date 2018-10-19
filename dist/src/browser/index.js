"use strict";

var _fetchUsingXHR = require("./fetchUsingXHR.js");

var _getNamespaceToRegister = require("../getNamespaceToRegister.js");

const browserSystem = new window.System.constructor();

browserSystem.instantiate = (url, parent) => {
  return (0, _fetchUsingXHR.fetchUsingXHR)(url).then(({
    status,
    headers,
    reason,
    body
  }) => {
    if (status < 200 || status >= 400) {
      return Promise.reject({
        status,
        reason,
        headers,
        body
      });
    }

    if (headers["content-type"] === "application/javascript") {
      body = `${body}
${"//#"} sourceURL=${url}`;

      try {
        window.eval(body);
      } catch (error) {
        return Promise.reject({
          code: "MODULE_INSTANTIATE_ERROR",
          error,
          url,
          parent
        });
      }

      return browserSystem.getRegister();
    }

    if (headers["content-type"] === "application/json") {
      return (0, _getNamespaceToRegister.getNamespaceToRegister)(() => {
        return {
          default: JSON.parse(body)
        };
      });
    }
  });
};

window.System = browserSystem;
//# sourceMappingURL=index.js.map