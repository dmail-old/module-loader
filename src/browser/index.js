import { sourceMappingURLMap } from "./sourceMappingURLMap.js"
import { fetchUsingXHR } from "./fetchUsingXHR.js"

const browserSystem = new window.System.constructor()

browserSystem.instantiate = (url, parent) => {
  return fetchUsingXHR(url).then(({ status, headers, reason, body }) => {
    if (status < 200 || status >= 300) {
      return Promise.reject({ status, reason, headers, body })
    }

    // faut absolutize le true... hum comment faire ?
    // pour le moment un truc harcode degeu
    // later we'll do this more clean, maybe server could return x-sourcemap-location
    // or we could resolve the path to that dynamically
    // like new URL(sourceMapURL, url)
    // where sourceMapURL= './file.js.map' and url = 'http://localhost:port/build/file.js'
    body = sourceMappingURLMap(body, () => `${url}.map`)
    body = `${body}
${"//#"} sourceURL=${url}`

    try {
      window.eval(body)
    } catch (error) {
      return Promise.reject({
        code: "MODULE_INSTANTIATE_ERROR",
        error,
        url,
        parent,
      })
    }

    return browserSystem.getRegister()
  })
}

window.System = browserSystem
