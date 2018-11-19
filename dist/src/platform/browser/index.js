"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createBrowserPlatform = void 0;

require("../../system/browser/index.js");

var _createLocaters = require("../createLocaters.js");

var _createImportTracker = require("../createImportTracker.js");

var _browserToCompileId = require("./browserToCompileId.js");

var _index2 = require("./browserDetect/index.js");

var _hotreload = require("./hotreload.js");

var _rejectionValueToMeta = require("./rejectionValueToMeta.js");

// propagating cancellation from server to client:
// server could execute a global function client side to request cancellation
// or client to connect to a server SSE asking for cancellation
// BUT this feature is not very important for now I guess
// client will just be killed if node controls it (chromium)
// otherwise we don't care
const createBrowserPlatform = ({
  remoteRoot,
  compileInto,
  compileMap,
  hotreload = false,
  hotreloadSSERoot,
  hotreloadCallback
}) => {
  if (typeof compileMap !== "object") {
    throw new TypeError(`createBrowserPlatform compileMap must be an object, got ${compileMap}`);
  }

  const browser = (0, _index2.detect)();
  const compileId = (0, _browserToCompileId.browserToCompileId)(browser, compileMap) || "otherwise";
  const {
    fileToRemoteCompiledFile,
    fileToRemoteInstrumentedFile,
    fileToRemoteSourceFile,
    hrefToFile
  } = (0, _createLocaters.createLocaters)({
    remoteRoot,
    compileInto,
    compileId
  });
  const {
    markFileAsImported,
    isFileImported
  } = (0, _createImportTracker.createImportTracker)();

  if (hotreload) {
    const hotreloadPredicate = file => {
      // isFileImported is useful in case the file was imported but is not
      // in System registry because it has a parse error or insantiate error
      if (isFileImported(file)) {
        return true;
      }

      const remoteCompiledFile = fileToRemoteCompiledFile(file);
      return Boolean(window.System.get(remoteCompiledFile));
    };

    (0, _hotreload.open)(hotreloadSSERoot, file => {
      if (hotreloadPredicate(file)) {
        hotreloadCallback({
          file
        });
      }
    });
  }

  const executeFile = ({
    file,
    instrument = false,
    setup = () => {},
    teardown = () => {}
  }) => {
    markFileAsImported(file);
    const remoteCompiledFile = instrument ? fileToRemoteCompiledFile(file) : fileToRemoteInstrumentedFile(file);
    return Promise.resolve().then(setup).then(() => window.System.import(remoteCompiledFile)).catch(error => {
      const meta = (0, _rejectionValueToMeta.rejectionValueToMeta)(error, {
        fileToRemoteSourceFile,
        hrefToFile
      });
      document.body.innerHTML = `<h1><a href="${fileToRemoteSourceFile(file)}">${file}</a> import rejected</h1>
		<pre style="border: 1px solid black">${meta.data}</pre>`;
      return Promise.reject(error);
    }).then(teardown);
  };

  return {
    executeFile
  };
};

exports.createBrowserPlatform = createBrowserPlatform;
//# sourceMappingURL=index.js.map