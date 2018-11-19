"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNodePlatform = exports.nodeVersionToCompileId = void 0;

var _https = _interopRequireDefault(require("https"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _projectStructureCompileBabel = require("@dmail/project-structure-compile-babel");

var _cancellation = require("@dmail/cancellation");

var _createImportTracker = require("../createImportTracker.js");

var _createNodeSystem = require("../../system/node/createNodeSystem.js");

var _createLocaters = require("../createLocaters.js");

var _valueInstall = require("./valueInstall.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const nodeVersionToCompileId = (version, compileMap) => {
  return Object.keys(compileMap).find(id => {
    const {
      compatMap
    } = compileMap[id];

    if ("node" in compatMap === false) {
      return false;
    }

    const versionForGroup = compatMap.node;
    return (0, _projectStructureCompileBabel.versionIsBelowOrEqual)(versionForGroup, version);
  });
};

exports.nodeVersionToCompileId = nodeVersionToCompileId;

const createNodePlatform = ({
  cancellationToken = (0, _cancellation.createCancellationToken)(),
  localRoot,
  remoteRoot,
  compileInto,
  compileMap
}) => {
  const compileId = nodeVersionToCompileId(process.version.slice(1), compileMap) || "otherwise";
  const {
    fileToRemoteCompiledFile,
    fileToRemoteInstrumentedFile,
    fileToLocalFile,
    hrefToLocalFile
  } = (0, _createLocaters.createLocaters)({
    localRoot,
    remoteRoot,
    compileInto,
    compileId
  });
  const {
    markFileAsImported
  } = (0, _createImportTracker.createImportTracker)();
  const nodeSystem = (0, _createNodeSystem.createNodeSystem)({
    urlToFilename: url => {
      return hrefToLocalFile(url);
    }
  });
  cancellationToken.register((0, _valueInstall.valueInstall)(_https.default.globalAgent.options, "rejectUnauthorized", false));
  cancellationToken.register((0, _valueInstall.valueInstall)(global, "fetch", _nodeFetch.default));
  cancellationToken.register((0, _valueInstall.valueInstall)(global, "System", nodeSystem));
  const platformCancellationToken = cancellationToken;

  const executeFile = async ({
    cancellationToken = (0, _cancellation.createCancellationToken)(),
    file,
    instrument = false,
    setup = () => {},
    teardown = () => {}
  }) => {
    cancellationToken = (0, _cancellation.cancellationTokenCompose)(platformCancellationToken, cancellationToken);
    await (0, _cancellation.cancellationTokenToPromise)(cancellationToken);
    markFileAsImported(file);
    await setup();
    const fileURL = instrument ? fileToRemoteInstrumentedFile(file) : fileToRemoteCompiledFile(file);
    let namespace;

    try {
      namespace = await global.System.import(fileURL);
    } catch (error) {
      if (error && error.status === 500 && error.reason === "parse error") {
        const data = JSON.parse(error.body);
        const parseError = new Error();
        Object.assign(parseError, data);
        parseError.message = data.message.replace(file, fileToLocalFile(file));
        throw parseError;
      }

      if (error && error.code === "MODULE_INSTANTIATE_ERROR") {
        throw error.error;
      }

      throw error;
    }

    const value = await teardown(namespace);
    return value;
  };

  return {
    executeFile
  };
};

exports.createNodePlatform = createNodePlatform;
//# sourceMappingURL=createNodePlatform.js.map