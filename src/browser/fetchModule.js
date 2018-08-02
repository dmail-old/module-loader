// import { baseURI } from 'es-module-loader/core/common.js'
// import { resolveIfNotPlain } from 'es-module-loader/core/resolve.js'

// var loader;

// // <script type="module"> support
// const anonymousSources = {}
// if (typeof document !== 'undefined' && document.getElementsByTagName) {
//   const ready = () => {
//     let anonymousCount = 0
// 		const scripts = document.getElementsByTagName('script')

//     for (var i = 0; i < scripts.length; i++) {
//       const script = scripts[i];
//       if (script.type === 'module' && !script.loaded) {
//         script.loaded = true
//         if (script.src) {
//           loader.import(script.src)
//         }
//         // anonymous modules supported via a custom naming scheme and registry
//         else {
//           let uri = `./<anon${++anonymousCount}>`;
//           if (script.id !== ""){
//             uri = `./${script.id}`
//           }

//           const anonName = resolveIfNotPlain(uri, baseURI)
//           anonymousSources[anonName] = script.innerHTML
//           loader.import(anonName)
//         }
//       }
//     }
//   }

//   if (document.readyState === 'complete') {
// 		setTimeout(ready)
// 	}
//   else {
// 		const DOMContentLoaded = () => {
// 			document.removeEventListener('DOMContentLoaded', DOMContentLoaded, false)
// 			ready()
// 		}
// 		document.addEventListener('DOMContentLoaded', DOMContentLoaded, false)
// 	}
// }

const fetchAnonymous = () => {
  return null
  // if (url in anonymousSources === false) {
  // 	return undefined
  // }
  // const source = anonymousSources[url]
  // delete anonymousSources[url]
  // return Promise.resolve(source)
}

const fetchUsingXHR = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    const load = () => {
      resolve(xhr.responseText)
    }

    const error = () => {
      reject(
        new Error(`XHR error (status: ${xhr.status}, text: ${xhr.statusText}) loading ${url})`),
      )
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        // in Chrome on file:/// URLs, status is 0
        if (xhr.status === 0) {
          if (xhr.responseText) {
            load()
          } else {
            // when responseText is empty, wait for load or error event
            // to inform if it is a 404 or empty file
            xhr.addEventListener("error", error)
            xhr.addEventListener("load", load)
          }
        } else if (xhr.status === 200) {
          load()
        } else {
          error()
        }
      }
    }
    xhr.open("GET", url, true)
    xhr.send(null)
  })
}

export const fetchModule = (url) => {
  return Promise.resolve(fetchAnonymous(url)).then((source) => {
    return typeof source === "string" ? source : fetchUsingXHR(url)
  })
}
