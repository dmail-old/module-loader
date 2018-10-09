import { isNodeBuiltinModule } from "./isNodeBuiltinModule.js"
import { Script } from "vm"

const MySystem = global.System

const systemPrototype = MySystem.prototype
// const instantiate = systemPrototype.instantiate

systemPrototype.instantiate = function(url, parent) {
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
      const localRoot = "" // comment on specifie ca ? process.env, global. System. ?
      const filename = `${localRoot}/${location}`
      const script = new Script(source, { filename })
      script.runInThisContext()
    })
    .then(systemJSPrototype.getRegister.bind(this))
}
