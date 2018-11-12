import fs from "fs"
import https from "https"
import fetch from "node-fetch"

https.globalAgent.options.rejectUnauthorized = false

const isWindows =
  typeof process !== "undefined" &&
  typeof process.platform === "string" &&
  process.platform.match(/^win/)

const fileUrlToPath = (fileUrl) => {
  if (fileUrl.substr(0, 7) !== "file://") {
    throw new RangeError(`${fileUrl} is not a valid file url`)
  }
  if (isWindows) {
    return fileUrl.substr(8).replace(/\\/g, "/")
  }
  return fileUrl.substr(7)
}

const fetchModuleFromFileSystem = (key) => {
  if (key.indexOf("file:") === 0) {
    const filePath = fileUrlToPath(key)
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (error, buffer) => {
        if (error) {
          reject(error)
        } else {
          resolve(String(buffer))
        }
      })
    }).then((source) => {
      return { status: 200, reason: "", headers: {}, body: source }
    })
  }
  return undefined
}

const getHeaderMapFromResponse = (response) => {
  const headerMap = {}
  response.headers.forEach((value, name) => {
    headerMap[name] = value
  })
  return headerMap
}

const fetchModuleFromServer = (url, parent) => {
  if (url.indexOf("http:") === 0 || url.indexOf("https:") === 0) {
    return fetch(url, {
      headers: {
        "x-module-referer": parent || url,
      },
    }).then((response) =>
      response.text().then((text) => {
        return {
          status: response.status,
          reason: response.statusText,
          headers: getHeaderMapFromResponse(response),
          body: text,
        }
      }),
    )
  }
  return undefined
}

export const fetchModule = (url, parent) => {
  return Promise.resolve(fetchModuleFromFileSystem(url, parent)).then((data) => {
    return data
      ? data
      : Promise.resolve(fetchModuleFromServer(url, parent)).then((data) => {
          if (data) {
            return data
          }
          throw new Error(`unsupported protocol for module ${url}`)
        })
  })
}
