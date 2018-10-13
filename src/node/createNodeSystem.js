import { isNodeBuiltinModule } from "./isNodeBuiltinModule.js"
import { Script } from "vm"
import { fetchModule } from "./fetchModule.js"
import "systemjs/dist/system.js"

export const createNodeSystem = ({ localRoot } = {}) => {
  return Promise.resolve().then(() => {
    const nodeSystem = new global.System.constructor()

    nodeSystem.instantiate = (url, parent) => {
      if (isNodeBuiltinModule(url)) {
        const nodeBuiltinModuleExports = require(url) // eslint-disable-line import/no-dynamic-require
        const bindings = {
          ...nodeBuiltinModuleExports,
          default: nodeBuiltinModuleExports,
        }
        const instantiateArgs = [
          [],
          (_export) => {
            return {
              execute: () => {
                _export(bindings)
              },
            }
          },
        ]
        return Promise.resolve(instantiateArgs)
      }

      return fetchModule(url, parent)
        .then(({ source, location }) => {
          // when System.import evaluates the code it has fetched
          // it uses require('vm').runInThisContext(code, { filename }).
          // This filename is very important because it allows the engine to be able
          // to resolve source map location inside evaluated code like //# sourceMappingURL=./file.js.map
          // and also to know where the file is to resolve other file when evaluating code
          const filename = `${localRoot}/${location}`
          const script = new Script(source, { filename })
          script.runInThisContext()
        })
        .then(() => nodeSystem.getRegister())
    }

    return nodeSystem
  })
}
