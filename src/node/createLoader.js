// https://github.com/ModuleLoader/node-es-module-loader

import { isNode } from "es-module-loader/core/common.js"
import { ModuleNamespace } from "es-module-loader/core/loader-polyfill.js"
import { Script } from "vm"
import { createLoader } from "../createLoader.js"
import { fetchModule } from "./fetchModule.js"
import { isNodeBuiltinModule } from "./isNodeBuiltinModule.js"

export const createNodeLoader = ({ base, getFilename = (key) => key } = {}) => {
  if (!isNode) {
    throw new Error("Node module loader can only be used in Node")
  }

  return createLoader({
    base,
    instantiate: (key, processAnonRegister) => {
      if (isNodeBuiltinModule(key)) {
        const nodeBuiltinModuleExports = require(key) // eslint-disable-line import/no-dynamic-require
        const bindings = {
          ...nodeBuiltinModuleExports,
          default: nodeBuiltinModuleExports,
        }
        return Promise.resolve(new ModuleNamespace(bindings))
      }

      return fetchModule(key).then(({ source, location }) => {
        const script = new Script(source, { filename: getFilename(key, location) })
        script.runInThisContext()
        processAnonRegister()
      })
    },
  })
}
