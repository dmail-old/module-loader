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
const pluginMap = (0, _projectStructureCompileBabel.pluginOptionMapToPluginMap)({
  "proposal-async-generator-functions": {},
  "proposal-json-strings": {},
  "proposal-object-rest-spread": {},
  "proposal-optional-catch-binding": {},
  "proposal-unicode-property-regex": {},
  "transform-arrow-functions": {},
  "transform-async-to-generator": {},
  "transform-block-scoped-functions": {},
  "transform-block-scoping": {},
  "transform-classes": {},
  "transform-computed-properties": {},
  "transform-destructuring": {},
  "transform-dotall-regex": {},
  "transform-duplicate-keys": {},
  "transform-exponentiation-operator": {},
  "transform-for-of": {},
  "transform-function-name": {},
  "transform-literals": {},
  "transform-new-target": {},
  "transform-object-super": {},
  "transform-parameters": {},
  "transform-regenerator": {},
  "transform-shorthand-properties": {},
  "transform-spread": {},
  "transform-sticky-regex": {},
  "transform-template-literals": {},
  "transform-typeof-symbol": {},
  "transform-unicode-regex": {}
});

const getBrowserSystemSource = ({
  name = "unknown",
  version = "0.0.0"
} = {}) => {
  const plugins = (0, _projectStructureCompileBabel.pluginMapToPluginsForPlatform)(pluginMap, name, version);
  const bundlePromise = rollup({
    input: inputFile,
    plugins: [nodeResolve({
      module: true
    }), babel({
      babelrc: false,
      exclude: "node_modules/**",
      plugins
    })] // comment line below to skip rollup warnings
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