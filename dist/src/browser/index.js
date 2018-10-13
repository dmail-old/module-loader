"use strict";

var _sourceMappingURLMap = require("./sourceMappingURLMap.js");

var _fetchUsingXHR = require("./fetchUsingXHR.js");

const browserSystem = new window.System.constructor();

browserSystem.instantiate = url => {
  return (0, _fetchUsingXHR.fetchUsingXHR)(url).then(({
    status,
    reason,
    body
  }) => {
    if (status === 500) {
      // check reason
      body = JSON.parse(body);
      debugger;
    }

    if (status >= 200 && status < 300) {
      // faut absolutize le true... hum comment faire ?
      // pour le moment un truc harcode degeu
      // later we'll do this more clean, maybe server could return x-sourcemap-location
      // or we could resolve the path to that dynamically
      // like new URL(sourceMapURL, url)
      // where sourceMapURL= './file.js.map' and url = 'http://localhost:port/build/file.js'
      body = (0, _sourceMappingURLMap.sourceMappingURLMap)(body, () => `${url}.map`);
      window.eval(body);
      return browserSystem.getRegister();
    } // ??

  });
};

window.System = browserSystem;
//# sourceMappingURL=index.js.map