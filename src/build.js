import { rollup } from "rollup"
import nodeResolve from "rollup-plugin-node-resolve"
import babel from "rollup-plugin-babel"
import path from "path"
import { writeCompilationResultOnFileSystem } from "./writeCompilationResultOnFileSystem.js"
import { createBabelOptions } from "@dmail/shared-config"
import { replaceBackSlashWithSlash } from "./replaceBackSlashWithSlash.js"

const projectRoot = replaceBackSlashWithSlash(path.resolve(__dirname, "../../"))

const variables = {
  node: {
    outputFormat: "cjs",
    location: `${projectRoot}/src/node`,
    inputRelativeLocation: `createLoader.js`,
    outputFolder: `${projectRoot}/dist/src/node`,
    outputRelativeLocation: 'index.js',
    sourceMapRelativeLocation: `index.js.map`,
  },
  browser: {
    outputFormat: "iife",
    location: `${projectRoot}/src/browser`,
    inputRelativeLocation: `createLoader.js`,
    outputFolder: `${projectRoot}/dist/src/browser`,
    outputRelativeLocation: 'index.js',
    sourceMapRelativeLocation: `index.js.map`,
  },
}

export const build = ({ type = "browser", minify = false } = {}) => {
  const {
    location,
    inputRelativeLocation,
    outputFolder,
    outputRelativeLocation,
    sourceMapRelativeLocation,
    outputFormat,
  } = variables[type]

  const inputLocation = `${location}/${inputRelativeLocation}`

  const babelOptions = {
    ...createBabelOptions({ minify }),
    // disabled babel rc because we're using the options above
    babelrc: false,
  }

  return rollup({
    entry: inputLocation,
    plugins: [
      // please keep in mind babel must not try to convert
      // require(), import or whatever module format is used because rollup takes care of that
      babel(babelOptions),
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
