import {
  pluginOptionMapToPluginMap,
  pluginMapToPluginsForPlatform,
} from "@dmail/project-structure-compile-babel"
import path from "path"
import { getSystemSource } from "./getSystemSource.js"

const { rollup } = require("rollup")
const babel = require("rollup-plugin-babel")
const nodeResolve = require("rollup-plugin-node-resolve")

const root = path.resolve(__dirname, "../../../")
const inputFile = `${root}/src/browser/index.js`
const pluginMap = pluginOptionMapToPluginMap({
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
  "transform-unicode-regex": {},
})

export const getBrowserSystemSource = ({ name = "unknown", version = "0.0.0" } = {}) => {
  const plugins = pluginMapToPluginsForPlatform(pluginMap, name, version)

  const bundlePromise = rollup({
    input: inputFile,
    plugins: [
      nodeResolve({
        module: true,
      }),
      babel({
        babelrc: false,
        exclude: "node_modules/**",
        plugins,
      }),
    ],
    // comment line below to skip rollup warnings
    // onwarn: () => {},
  })
  const systemSourcePromise = getSystemSource()

  return Promise.all([bundlePromise, systemSourcePromise]).then(([bundle, systemSource]) => {
    return bundle.generate({
      intro: systemSource,
      format: "iife",
      sourcemap: true,
    })
  })
}
