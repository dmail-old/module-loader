import { fileUrlToPath } from "es-module-loader/core/common.js"
import fetch from "node-fetch/lib/index.es.js"
import https from "https"
import fs from "fs"

https.globalAgent.options.rejectUnauthorized = false

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
		})
	}
	return undefined
}

const fetchModuleFromServer = (key) => {
	if (key.indexOf("http:") === 0 || key.indexOf("https:") === 0) {
		return fetch(key).then((response) => response.text())
	}
	return undefined
}

export const fetchModule = (key) => {
	return Promise.resolve(fetchModuleFromFileSystem(key)).then((source) => {
		return typeof source === 'string' ? source : Promise.resolve(fetchModuleFromServer(key)).then((source) => {
			if (typeof source === 'string') {
				return source
			}
			throw new Error(`unsupported protocol for module ${key}`)
		})
	})
}
