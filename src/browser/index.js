import { fetchUsingXHR } from "./fetchUsingXHR.js"

const browserSystem = new window.System.constructor()

browserSystem.instantiate = (url, parent) => {
  return fetchUsingXHR(url).then(({ status, headers, reason, body }) => {
    if (status < 200 || status >= 400) {
      return Promise.reject({ status, reason, headers, body })
    }

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
