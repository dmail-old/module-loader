import { isNodeBuiltinModule } from "./isNodeBuiltinModule.js"
import { Script } from "vm"
import { fetchModule } from "./fetchModule.js"
import "systemjs/dist/system.js"
import { getNamespaceToRegister } from "../getNamespaceToRegister.js"

export const createNodeSystem = ({ localRoot } = {}) => {
  const nodeSystem = new global.System.constructor()

  nodeSystem.instantiate = (url, parent) => {
    if (isNodeBuiltinModule(url)) {
      return getNamespaceToRegister(() => {
        const nodeBuiltinModuleExports = require(url) // eslint-disable-line import/no-dynamic-require
        return {
          ...nodeBuiltinModuleExports,
          default: nodeBuiltinModuleExports,
        }
      })
    }

    return fetchModule(url, parent).then(({ status, reason, headers, body }) => {
      if (status < 200 || status >= 300) {
        return Promise.reject({ status, reason, headers, body })
      }

      // when System.import evaluates the code it has fetched
      // it uses require('vm').runInThisContext(code, { filename }).
      // This filename is very important because it allows the engine to be able
      // to resolve source map location inside evaluated code like //# sourceMappingURL=./file.js.map
      // and also to know where the file is to resolve other file when evaluating code
      const filename = "x-location" in headers ? `${localRoot}/${headers["x-location"]}` : url
      const script = new Script(body, { filename })
      try {
        script.runInThisContext()
      } catch (error) {
        return Promise.reject({
          code: "MODULE_INSTANTIATE_ERROR",
          error,
          url,
          parent,
        })
      }

      return nodeSystem.getRegister()
    })
  }

  return nodeSystem
}
