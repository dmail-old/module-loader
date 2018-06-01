// https://github.com/ModuleLoader/browser-es-module-loader

import { createLoader } from "../createLoader.js"
import { fetchModule } from "./fetchModule.js"

export const createBrowserLoader = ({ base } = {}) => {
	return createLoader({
		base,
		instantiate: (key, processAnonRegister) => {
      return fetchModule(key).then((source) => {
        ;(0, eval)(source)
        processAnonRegister()
      })
    },
	})
}
