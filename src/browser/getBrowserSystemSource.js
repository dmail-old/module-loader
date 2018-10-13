import {
  compatMapBabel,
  getPluginNamesForPlatform,
  getPluginsFromNames,
} from "@dmail/project-structure-compile-babel"
import path from "path"
import { getSystemSource } from "./getSystemSource.js"

const { rollup } = require("rollup")
const babel = require("rollup-plugin-babel")
const nodeResolve = require("rollup-plugin-node-resolve")

const root = path.resolve(__dirname, "../../../")
const inputFile = `${root}/src/browser/index.js`

export const getBrowserSystemSource = ({ name = "unknown", version = "0.0.0" } = {}) => {
  const pluginNames = getPluginNamesForPlatform(compatMapBabel, name, version)
  const plugins = getPluginsFromNames(pluginNames)

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
    // skip rollup warnings
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
