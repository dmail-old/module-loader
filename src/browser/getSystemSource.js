import fs from "fs"
import { getSystemLocation } from "./getSystemLocation.js"

let systemSourcePromise

export const getSystemSource = () => {
  if (systemSourcePromise) {
    return systemSourcePromise
  }

  systemSourcePromise = Promise.resolve()
    .then(() => getSystemLocation())
    .then((systemLocation) => {
      return new Promise((resolve, reject) => {
        fs.readFile(systemLocation, (error, buffer) => {
          if (error) {
            reject(error)
          } else {
            resolve(buffer.toString())
          }
        })
      })
    })

  return systemSourcePromise
}
