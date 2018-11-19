"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compileBrowserPlatform = void 0;

var _projectStructureCompileBabel = require("@dmail/project-structure-compile-babel");

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

const {
  rollup
} = require("rollup");

const babel = require("rollup-plugin-babel");

const nodeResolve = require("rollup-plugin-node-resolve");

const localRoot = _path.default.resolve(__dirname, "../../");

debugger;
const inputFile = `${localRoot}/src/platform/browser/index.js`;
const pluginMap = (0, _projectStructureCompileBabel.pluginOptionMapToPluginMap)({
  "proposal-object-rest-spread": {},
  "proposal-optional-catch-binding": {},
  "proposal-unicode-property-regex": {},
  "transform-arrow-functions": {},
  "transform-block-scoped-functions": {},
  "transform-block-scoping": {},
  "transform-computed-properties": {},
  "transform-destructuring": {},
  "transform-dotall-regex": {},
  "transform-duplicate-keys": {},
  "transform-exponentiation-operator": {},
  "transform-function-name": {},
  "transform-literals": {},
  "transform-object-super": {},
  "transform-parameters": {},
  "transform-shorthand-properties": {},
  "transform-spread": {},
  "transform-sticky-regex": {},
  "transform-template-literals": {},
  "transform-typeof-symbol": {}
});

const compileBrowserPlatform = async ({
  name = "unknown",
  version = "0.0.0"
} = {}) => {
  const plugins = (0, _projectStructureCompileBabel.pluginMapToPluginsForPlatform)(pluginMap, name, version);
  const bundle = await rollup({
    input: inputFile,
    plugins: [nodeResolve({
      module: true
    }), babel({
      babelrc: false,
      exclude: "node_modules/**",
      plugins
    })],
    // skip rollup warnings
    onwarn: () => {}
  });
  return bundle.generate({
    format: "iife",
    name: "__browserPlatform__",
    sourcemap: true
  });
};

exports.compileBrowserPlatform = compileBrowserPlatform;
//# sourceMappingURL=compileBrowserPlatform.js.map