const { rollup } = require("rollup")
const babel = require("rollup-plugin-babel")
const nodeResolve = require("rollup-plugin-node-resolve")
const path = require("path")
const { createGetGroupForPlatform } = require("@dmail/project-structure-compile-babel")

const root = path.resolve(__dirname, "../")
const inputFile = `${root}/src/browser/createLoader.js`
const outputFile = `${root}/browser.js`

const compileForBrowser = ({ platformName, platformVersion }) => {
  const { getGroupForPlatform } = createGetGroupForPlatform()

  const { plugins } = getGroupForPlatform({
    platformName,
    platformVersion,
  })

  return rollup({
    input: inputFile,
    plugins: [
      nodeResolve({
        module: false,
        jsnext: false,
      }),
      babel({
        babelrc: false,
        exclude: "node_modules/**",
        plugins,
      }),
    ],
    // skip rollup warnings (specifically the eval warning)
    onwarn: () => {},
  })
}

compileForBrowser({
  // for now, prebuild for an unknown browser
  // we could also export this function to allow
  // compiling once we know the browser that will run the code
  platformName: "unknown",
})
  .then((bundle) => {
    return bundle.write({
      format: "iife",
      name: "createBrowserLoader",
      file: outputFile,
      sourcemap: true,
    })
  })
  .then(() => {
    console.log("build done")
  }, console.error)
