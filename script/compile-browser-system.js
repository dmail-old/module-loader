const { compileBrowserSystem } = require("../dist/index.js")
// TODO, import this from '@dmail/helper'
// const { fileSystemWriteCompileResult } = require('@dmail/helper')
const { fileSystemWriteCompileResult } = require("./fileSystemWriteCompileResult.js")
const path = require("path")

const localRoot = path.resolve(__dirname, "../")

debugger
compileBrowserSystem().then((compileResult) => {
  debugger
  fileSystemWriteCompileResult(compileResult, `${localRoot}/dist/browser-system.js`)
})
