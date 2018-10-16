import { fetchUsingXHR } from "./fetchUsingXHR.js"

const browserSystem = new window.System.constructor()

browserSystem.instantiate = (url, parent) => {
  return fetchUsingXHR(url).then(({ status, headers, reason, body }) => {
    if (status < 200 || status >= 300) {
      return Promise.reject({ status, reason, headers, body })
    }

    const sourceMapName = headers["x-sourcemap-name"]
    const sourceLocation = headers["x-location"]
    const lastSlashIndex = sourceLocation.lastIndexOf("/")
    const sourceDirname = location.slice(
      0,
      lastSlashIndex === -1 ? sourceLocation.length : lastSlashIndex,
    )
    const sourceMapLocation = `${sourceDirname}/${sourceMapName}`

    body = `${body}
${"//#"} sourceMappingURL=${sourceMapLocation}
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
