"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createBrowserPlatform = exports.browserToCompileId = void 0;

var _versionCompare = require("@dmail/project-structure-compile-babel/src/versionCompare.js");

var _createImportTracker = require("../createImportTracker.js");

var _index = require("./browserDetect/index.js");

var _hotreload = require("./hotreload.js");

var _stringToStringWithLink = require("./stringToStringWithLink.js");

var _createLocaters = require("../createLocaters.js");

// propagating cancellation from server to client:
// server could execute a global function client side to request cancellation
// or client to connect to a server SSE asking for cancellation
// BUT this feature is not very important for now I guess
// client will just be killed if node controls it (chromium)
// otherwise we don't care
const parseErrorToMeta = (error, {
  fileToRemoteSourceFile
}) => {
  const parseError = JSON.parse(error.body);
  const file = parseError.fileName;
  const message = parseError.message;
  const data = message.replace(file, (0, _stringToStringWithLink.link)(`${fileToRemoteSourceFile(file)}`, file));
  return {
    file,
    data
  };
};

const errorToMeta = error => {
  return {
    data: (0, _stringToStringWithLink.stringToStringWithLink)(error.stack)
  };
};

const rejectionValueToMeta = (error, {
  fileToRemoteSourceFile,
  hrefToFile
}) => {
  if (error && error.status === 500 && error.reason === "parse error") {
    return parseErrorToMeta(error, {
      fileToRemoteSourceFile
    });
  }

  if (error && error.code === "MODULE_INSTANTIATE_ERROR") {
    const file = hrefToFile(error.url);
    const originalError = error.error;
    return {
      file,
      // eslint-disable-next-line no-use-before-define
      data: rejectionValueToMeta(originalError, {
        fileToRemoteSourceFile,
        hrefToFile
      })
    };
  }

  if (error && error instanceof Error) {
    return errorToMeta(error);
  }

  return {
    data: JSON.stringify(error)
  };
};

const browserToCompileId = ({
  name,
  version
}, compileMap) => {
  return Object.keys(compileMap).find(id => {
    const {
      compatMap
    } = compileMap[id];

    if (name in compatMap === false) {
      return false;
    }

    const versionForGroup = compatMap[name];
    return (0, _versionCompare.versionIsBelowOrEqual)(versionForGroup, version);
  });
};

exports.browserToCompileId = browserToCompileId;

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

  const browser = (0, _index.detect)();
  const compileId = browserToCompileId(browser, compileMap) || "otherwise";
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
      const meta = rejectionValueToMeta(error, {
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
//# sourceMappingURL=browserPlatform.js.map