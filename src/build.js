import { createConfig, createSyntaxOptions, mergeOptions } from "@dmail/shared-config/dist/babel.js"
import path from "path"
import { rollup } from "rollup"
import babel from "rollup-plugin-babel"
import nodeResolve from "rollup-plugin-node-resolve"
import { replaceBackSlashWithSlash } from "./replaceBackSlashWithSlash.js"
import { writeCompilationResultOnFileSystem } from "./writeCompilationResultOnFileSystem.js"

const projectRoot = replaceBackSlashWithSlash(path.resolve(__dirname, "../../"))

const variables = {
  node: {
    outputFormat: "cjs",
    location: `${projectRoot}/src/node`,
    inputRelativeLocation: `createLoader.js`,
    outputFolder: `${projectRoot}/src/node`,
    outputRelativeLocation: "index.js",
    sourceMapRelativeLocation: `index.js.map`,
  },
  browser: {
    outputFormat: "iife",
    location: `${projectRoot}/src/browser`,
    inputRelativeLocation: `createLoader.js`,
    outputFolder: `${projectRoot}/src/browser`,
    outputRelativeLocation: "index.js",
    sourceMapRelativeLocation: `index.js.map`,
  },
}

export const build = ({ type = "browser" } = {}) => {
  const {
    location,
    inputRelativeLocation,
    outputFolder,
    outputRelativeLocation,
    sourceMapRelativeLocation,
    outputFormat,
  } = variables[type]

  const inputLocation = `${location}/${inputRelativeLocation}`

  const babelConfig = createConfig(
    mergeOptions(createSyntaxOptions(), {
      // disabled babel rc because we're using the options above
      babelrc: false,
    }),
  )

  return rollup({
    entry: inputLocation,
    plugins: [
      // please keep in mind babel must not try to convert
      // require(), import or whatever module format is used because rollup takes care of that
      babel(babelConfig),
      nodeResolve({
        module: false,
        jsnext: false,
      }),
    ],
    // skip rollup warnings (specifically the eval warning)
    onwarn: () => {},
  })
    .then((bundle) => {
      return bundle.generate({
        format: outputFormat,
        name: "createBrowserLoader",
        sourcemap: true,
      })
    })
    .then(({ code, map }) => {
      return writeCompilationResultOnFileSystem({
        output: code,
        sourceMap: map,
        location,
        inputRelativeLocation,
        outputFolder,
        outputRelativeLocation,
        sourceMapRelativeLocation,
      })
    })
}
