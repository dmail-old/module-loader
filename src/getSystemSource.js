import fs from "fs"
import path from "path"

const root = path.resolve(__dirname, "../../")
const systemLocation = `${root}/node_modules/systemjs/dist/system.js`

let systemSourcePromise

export const getSystemSource = () => {
  if (systemSourcePromise) {
    return systemSourcePromise
  }

  systemSourcePromise = new Promise((resolve, reject) => {
    fs.readFile(systemLocation, (error, buffer) => {
      if (error) {
        reject(error)
      } else {
        resolve(buffer.toString())
      }
    })
  })

  return systemSourcePromise
}
