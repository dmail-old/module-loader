// https://github.com/ModuleLoader/browser-es-module-loader

import { createLoader } from "../createLoader.js"

// https://github.com/ModuleLoader/system-register-loader/blob/master/src/system-register-loader.js#L81
// we fetch using script else sourcemap are not loaded by browser
const fetchAndEvalUsingScript = (key) => {
  return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.charset = 'utf-8'
		script.async = true
		script.src = key
		document.head.appendChild(script)

		const cleanup = () => {
			document.head.removeChild(script)
		}

		const onload = () => {
			script.removeEventListener('load', onload, false)
			cleanup()
			resolve()
		}

		const onerror = (error) => {
			script.removeEventListener('error', onerror, false)
			cleanup()
			reject(new Error(`Error while fetching ${key}: ${error}`))
		}

		script.addEventListener('load', onload, false)
		script.addEventListener('error', onerror, false)
	})
}

export const createBrowserLoader = ({ base } = {}) => {
	return createLoader({
		base,
		instantiate: (key, processAnonRegister) => {
			return fetchAndEvalUsingScript(key).then(() => {
				processAnonRegister()
			})
    },
	})
}
