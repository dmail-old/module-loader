"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBrowserSystemSource = void 0;

var _projectStructureCompileBabel = require("@dmail/project-structure-compile-babel");

var _path = _interopRequireDefault(require("path"));

var _getSystemSource = require("./getSystemSource.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  rollup
} = require("rollup");

const babel = require("rollup-plugin-babel");

const nodeResolve = require("rollup-plugin-node-resolve");

const root = _path.default.resolve(__dirname, "../../../");

const inputFile = `${root}/src/browser/index.js`;

const getBrowserSystemSource = ({
  name = "unknown",
  version = "0.0.0"
} = {}) => {
  const pluginNames = (0, _projectStructureCompileBabel.getPluginNamesForPlatform)(_projectStructureCompileBabel.compatMapBabel, name, version);
  const plugins = (0, _projectStructureCompileBabel.getPluginsFromNames)(pluginNames);
  const bundlePromise = rollup({
    input: inputFile,
    plugins: [nodeResolve({
      module: true
    }), babel({
      babelrc: false,
      exclude: "node_modules/**",
      plugins
    })] // skip rollup warnings
    // onwarn: () => {},

  });
  const systemSourcePromise = (0, _getSystemSource.getSystemSource)();
  return Promise.all([bundlePromise, systemSourcePromise]).then(([bundle, systemSource]) => {
    return bundle.generate({
      intro: systemSource,
      format: "iife",
      sourcemap: true
    });
  });
};

exports.getBrowserSystemSource = getBrowserSystemSource;
//# sourceMappingURL=getBrowserSystemSource.js.map