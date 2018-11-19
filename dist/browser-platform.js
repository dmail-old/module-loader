var __browserPlatform__ = (function (exports) {
  'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  /*
  * SystemJS 2.0.2
  */
  (function () {
    const hasSelf = typeof self !== 'undefined';

    const envGlobal = hasSelf ? self : global;

    let baseUrl;
    if (typeof location !== 'undefined') {
      baseUrl = location.href.split('#')[0].split('?')[0];
      const lastSepIndex = baseUrl.lastIndexOf('/');
      if (lastSepIndex !== -1)
        baseUrl = baseUrl.slice(0, lastSepIndex + 1);
    }

    const backslashRegEx = /\\/g;
    function resolveIfNotPlainOrUrl (relUrl, parentUrl) {
      if (relUrl.indexOf('\\') !== -1)
        relUrl = relUrl.replace(backslashRegEx, '/');
      // protocol-relative
      if (relUrl[0] === '/' && relUrl[1] === '/') {
        return parentUrl.slice(0, parentUrl.indexOf(':') + 1) + relUrl;
      }
      // relative-url
      else if (relUrl[0] === '.' && (relUrl[1] === '/' || relUrl[1] === '.' && (relUrl[2] === '/' || relUrl.length === 2 && (relUrl += '/')) ||
          relUrl.length === 1  && (relUrl += '/')) ||
          relUrl[0] === '/') {
        const parentProtocol = parentUrl.slice(0, parentUrl.indexOf(':') + 1);
        // Disabled, but these cases will give inconsistent results for deep backtracking
        //if (parentUrl[parentProtocol.length] !== '/')
        //  throw new Error('Cannot resolve');
        // read pathname from parent URL
        // pathname taken to be part after leading "/"
        let pathname;
        if (parentUrl[parentProtocol.length + 1] === '/') {
          // resolving to a :// so we need to read out the auth and host
          if (parentProtocol !== 'file:') {
            pathname = parentUrl.slice(parentProtocol.length + 2);
            pathname = pathname.slice(pathname.indexOf('/') + 1);
          }
          else {
            pathname = parentUrl.slice(8);
          }
        }
        else {
          // resolving to :/ so pathname is the /... part
          pathname = parentUrl.slice(parentProtocol.length + (parentUrl[parentProtocol.length] === '/'));
        }

        if (relUrl[0] === '/')
          return parentUrl.slice(0, parentUrl.length - pathname.length - 1) + relUrl;

        // join together and split for removal of .. and . segments
        // looping the string instead of anything fancy for perf reasons
        // '../../../../../z' resolved to 'x/y' is just 'z'
        const segmented = pathname.slice(0, pathname.lastIndexOf('/') + 1) + relUrl;

        const output = [];
        let segmentIndex = -1;
        for (let i = 0; i < segmented.length; i++) {
          // busy reading a segment - only terminate on '/'
          if (segmentIndex !== -1) {
            if (segmented[i] === '/') {
              output.push(segmented.slice(segmentIndex, i + 1));
              segmentIndex = -1;
            }
          }

          // new segment - check if it is relative
          else if (segmented[i] === '.') {
            // ../ segment
            if (segmented[i + 1] === '.' && (segmented[i + 2] === '/' || i + 2 === segmented.length)) {
              output.pop();
              i += 2;
            }
            // ./ segment
            else if (segmented[i + 1] === '/' || i + 1 === segmented.length) {
              i += 1;
            }
            else {
              // the start of a new segment as below
              segmentIndex = i;
            }
          }
          // it is the start of a new segment
          else {
            segmentIndex = i;
          }
        }
        // finish reading out the last segment
        if (segmentIndex !== -1)
          output.push(segmented.slice(segmentIndex));
        return parentUrl.slice(0, parentUrl.length - pathname.length) + output.join('');
      }
    }

    /*
     * Package name maps implementation
     *
     * Reduced implementation - only a single scope level is supported
     * 
     * To make lookups fast we pre-resolve the entire package name map
     * and then match based on backtracked hash lookups
     * 
     * path_prefix in scopes not supported
     * nested scopes not supported
     */

    function resolveUrl (relUrl, parentUrl) {
      return resolveIfNotPlainOrUrl(relUrl, parentUrl) ||
          relUrl.indexOf(':') !== -1 && relUrl ||
          resolveIfNotPlainOrUrl('./' + relUrl, parentUrl);
    }

    function createPackageMap (json, baseUrl) {
      if (json.path_prefix) {
        baseUrl = resolveUrl(json.path_prefix, baseUrl);
        if (baseUrl[baseUrl.length - 1] !== '/')
          baseUrl += '/';
      }
        
      const basePackages = json.packages || {};
      const scopes = {};
      if (json.scopes) {
        for (let scopeName in json.scopes) {
          const scope = json.scopes[scopeName];
          if (scope.path_prefix)
            throw new Error('Scope path_prefix not currently supported');
          if (scope.scopes)
            throw new Error('Nested scopes not currently supported');
          let resolvedScopeName = resolveUrl(scopeName, baseUrl);
          if (resolvedScopeName[resolvedScopeName.length - 1] === '/')
            resolvedScopeName = resolvedScopeName.substr(0, resolvedScopeName.length - 1);
          scopes[resolvedScopeName] = scope.packages || {};
        }
      }

      function getMatch (path, matchObj) {
        let sepIndex = path.length;
        do {
          const segment = path.slice(0, sepIndex);
          if (segment in matchObj)
            return segment;
        } while ((sepIndex = path.lastIndexOf('/', sepIndex - 1)) !== -1)
      }

      function applyPackages (id, packages, baseUrl) {
        const pkgName = getMatch(id, packages);
        if (pkgName) {
          const pkg = packages[pkgName];
          if (pkgName === id) {
            if (typeof pkg === 'string')
              return resolveUrl(pkg, baseUrl + pkgName + '/');
            if (!pkg.main)
              throw new Error('Package ' + pkgName + ' has no main');
            return resolveUrl(
              (pkg.path ? pkg.path + (pkg.path[pkg.path.length - 1] === '/' ? '' : '/') : pkgName + '/') + pkg.main,
              baseUrl
            );
          }
          else {
            return resolveUrl(
              (typeof pkg === 'string' || !pkg.path
                ? pkgName + '/'
                : pkg.path + (pkg.path[pkg.path.length - 1] === '/' ? '' : '/')
              ) + id.slice(pkgName.length + 1)
            , baseUrl);
          }
        }
      }

      return function (id, parentUrl) {
        const scopeName = getMatch(parentUrl, scopes);
        if (scopeName) {
          const scopePackages = scopes[scopeName];
          const packageResolution = applyPackages(id, scopePackages, scopeName + '/');
          if (packageResolution)
            return packageResolution;
        }
        return applyPackages(id, basePackages, baseUrl) || throwBare(id, parentUrl);
      };
    }

    function throwBare (id, parentUrl) {
      throw new Error('Unable to resolve bare specifier "' + id + (parentUrl ? '" from ' + parentUrl : '"'));
    }

    /*
     * SystemJS Core
     * 
     * Provides
     * - System.import
     * - System.register support for
     *     live bindings, function hoisting through circular references,
     *     reexports, dynamic import, import.meta.url, top-level await
     * - System.getRegister to get the registration
     * - Symbol.toStringTag support in Module objects
     * - Hookable System.createContext to customize import.meta
     * - System.onload(id, err?) handler for tracing / hot-reloading
     * 
     * Core comes with no System.prototype.resolve or
     * System.prototype.instantiate implementations
     */

    const hasSymbol = typeof Symbol !== 'undefined';
    const toStringTag = hasSymbol && Symbol.toStringTag;
    const REGISTRY = hasSymbol ? Symbol() : '@';

    function SystemJS () {
      this[REGISTRY] = {};
    }

    const systemJSPrototype = SystemJS.prototype;
    systemJSPrototype.import = function (id, parentUrl) {
      const loader = this;
      return Promise.resolve(loader.resolve(id, parentUrl))
      .then(function (id) {
        const load = getOrCreateLoad(loader, id);
        return load.C || topLevelLoad(loader, load);
      });
    };

    // Hookable createContext function -> allowing eg custom import meta
    systemJSPrototype.createContext = function (parentId) {
      return {
        url: parentId
      };
    };

    // onLoad(id, err) provided for tracing / hot-reloading
    systemJSPrototype.onload = function () {};

    let lastRegister;
    systemJSPrototype.register = function (deps, declare) {
      lastRegister = [deps, declare];
    };

    /*
     * getRegister provides the last anonymous System.register call
     */
    systemJSPrototype.getRegister = function () {
      const _lastRegister = lastRegister;
      lastRegister = undefined;
      return _lastRegister;
    };

    function getOrCreateLoad (loader, id, firstParentUrl) {
      let load = loader[REGISTRY][id];
      if (load)
        return load;

      const importerSetters = [];
      const ns = Object.create(null);
      if (toStringTag)
        Object.defineProperty(ns, toStringTag, { value: 'Module' });
      
      let instantiatePromise = Promise.resolve()
      .then(function () {
        return loader.instantiate(id, firstParentUrl);
      })
      .then(function (registration) {
        if (!registration)
          throw new Error('Module ' + id + ' did not instantiate');
        function _export (name, value) {
          // note if we have hoisted exports (including reexports)
          load.h = true;
          let changed = false;
          if (typeof name !== 'object') {
            if (!(name in ns) || ns[name] !== value) {
              ns[name] = value;
              changed = true;
            }
          }
          else {
            for (let p in name) {
              let value = name[p];
              if (!(p in ns) || ns[p] !== value) {
                ns[p] = value;
                changed = true;
              }
            }
          }
          if (changed)
            for (let i = 0; i < importerSetters.length; i++)
              importerSetters[i](ns);
          return value;
        }
        const declared = registration[1](_export, registration[1].length === 2 ? {
          import: function (importId) {
            return loader.import(importId, id);
          },
          meta: loader.createContext(id)
        } : undefined);
        load.e = declared.execute || function () {};
        return [registration[0], declared.setters || []];
      });

      instantiatePromise = instantiatePromise.catch(function (err) {
          loader.onload(load.id, err);
          throw err;
        });

      const linkPromise = instantiatePromise
      .then(function (instantiation) {
        return Promise.all(instantiation[0].map(function (dep, i) {
          const setter = instantiation[1][i];
          return Promise.resolve(loader.resolve(dep, id))
          .then(function (depId) {
            const depLoad = getOrCreateLoad(loader, depId, id);
            // depLoad.I may be undefined for already-evaluated
            return Promise.resolve(depLoad.I)
            .then(function () {
              if (setter) {
                depLoad.i.push(setter);
                // only run early setters when there are hoisted exports of that module
                // the timing works here as pending hoisted export calls will trigger through importerSetters
                if (depLoad.h || !depLoad.I)
                  setter(depLoad.n);
              }
              return depLoad;
            });
          })
        }))
        .then(function (depLoads) {
          load.d = depLoads;
        });
      });

      // disable unhandled rejections
      linkPromise.catch(function () {});

      // Captial letter = a promise function
      return load = loader[REGISTRY][id] = {
        id: id,
        // importerSetters, the setters functions registered to this dependency
        // we retain this to add more later
        i: importerSetters,
        // module namespace object
        n: ns,

        // instantiate
        I: instantiatePromise,
        // link
        L: linkPromise,
        // whether it has hoisted exports
        h: false,

        // On instantiate completion we have populated:
        // dependency load records
        d: undefined,
        // execution function
        // set to NULL immediately after execution (or on any failure) to indicate execution has happened
        // in such a case, pC should be used, and pLo, pLi will be emptied
        e: undefined,

        // On execution we have populated:
        // the execution error if any
        eE: undefined,
        // in the case of TLA, the execution promise
        E: undefined,

        // On execution, pLi, pLo, e cleared

        // Promise for top-level completion
        C: undefined
      };
    }

    function instantiateAll (loader, load, loaded) {
      if (!loaded[load.id]) {
        loaded[load.id] = true;
        // load.L may be undefined for already-instantiated
        return Promise.resolve(load.L)
        .then(function () {
          return Promise.all(load.d.map(function (dep) {
            return instantiateAll(loader, dep, loaded);
          }));
        })
      }
    }

    function topLevelLoad (loader, load) {
      return load.C = instantiateAll(loader, load, {})
      .then(function () {
        return postOrderExec(loader, load, {});
      })
      .then(function () {
        return load.n;
      });
    }

    // the closest we can get to call(undefined)
    const nullContext = Object.freeze(Object.create(null));

    // returns a promise if and only if a top-level await subgraph
    // throws on sync errors
    function postOrderExec (loader, load, seen) {
      if (seen[load.id])
        return;
      seen[load.id] = true;

      if (!load.e) {
        if (load.eE)
          throw load.eE;
        if (load.E)
          return load.E;
        return;
      }

      // deps execute first, unless circular
      let depLoadPromises;
      load.d.forEach(function (depLoad) {
        {
          try {
            const depLoadPromise = postOrderExec(loader, depLoad, seen);
            if (depLoadPromise)
              (depLoadPromises = depLoadPromises || []).push(depLoadPromise);
          }
          catch (err) {
            loader.onload(load.id, err);
            throw err;
          }
        }
      });
      if (depLoadPromises) {
        return Promise.all(depLoadPromises)
          .then(doExec)
          .catch(function (err) {
            loader.onload(load.id, err);
            throw err;
          });
      }

      return doExec();

      function doExec () {
        try {
          let execPromise = load.e.call(nullContext);
          if (execPromise) {
            execPromise = execPromise.then(function () {
                load.C = load.n;
                load.E = null; // indicates completion
                loader.onload(load.id, null);
              }, function () {
                loader.onload(load.id, err);
                throw err;
              });
            execPromise.catch(function () {});
            return load.E = load.E || execPromise;
          }
          // (should be a promise, but a minify optimization to leave out Promise.resolve)
          load.C = load.n;
          loader.onload(load.id, null);
        }
        catch (err) {
          loader.onload(load.id, err);
          load.eE = err;
          throw err;
        }
        finally {
          load.L = load.I = undefined;
          load.e = null;
        }
      }
    }

    envGlobal.System = new SystemJS();

    /*
     * Supports loading System.register via script tag injection
     */

    let err$1;
    if (typeof window !== 'undefined')
      window.addEventListener('error', function (e) {
        err$1 = e.error;
      });

    const systemRegister = systemJSPrototype.register;
    systemJSPrototype.register = function (deps, declare) {
      err$1 = undefined;
      systemRegister.call(this, deps, declare);
    };

    systemJSPrototype.instantiate = function (url, firstParentUrl) {
      const loader = this;
      return new Promise(function (resolve, reject) {
        const script = document.createElement('script');
        script.charset = 'utf-8';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.addEventListener('error', function () {
          reject(new Error('Error loading ' + url + (firstParentUrl ? ' from ' + firstParentUrl : '')));
        });
        script.addEventListener('load', function () {
          document.head.removeChild(script);
          // Note URL normalization issues are going to be a careful concern here
          if (err$1)
            return reject(err$1);
          else
            resolve(loader.getRegister());
        });
        script.src = url;
        document.head.appendChild(script);
      });
    };

    /*
     * Supports loading System.register in workers
     */

    if (hasSelf && typeof importScripts === 'function')
      systemJSPrototype.instantiate = function (url) {
        const loader = this;
        return new Promise(function (resolve, reject) {
          try {
            importScripts(url);
          }
          catch (e) {
            reject(e);
          }
          resolve(loader.getRegister());
        });
      };

    /*
     * SystemJS global script loading support
     * Extra for the s.js build only
     * (Included by default in system.js build)
     */
    (function (global) {

    const systemJSPrototype = System.constructor.prototype;

    // safari unpredictably lists some new globals first or second in object order
    let firstGlobalProp, secondGlobalProp, lastGlobalProp;
    function getGlobalProp () {
      let cnt = 0;
      let lastProp;
      for (let p in global) {
        if (!global.hasOwnProperty(p))
          continue;
        if (cnt === 0 && p !== firstGlobalProp || cnt === 1 && p !== secondGlobalProp)
          return p;
        cnt++;
        lastProp = p;
      }
      if (lastProp !== lastGlobalProp)
        return lastProp;
    }

    function noteGlobalProps () {
      // alternatively Object.keys(global).pop()
      // but this may be faster (pending benchmarks)
      firstGlobalProp = secondGlobalProp = undefined;
      for (let p in global) {
        if (!global.hasOwnProperty(p))
          continue;
        if (!firstGlobalProp)
          firstGlobalProp = p;
        else if (!secondGlobalProp)
          secondGlobalProp = p;
        lastGlobalProp = p;
      }
      return lastGlobalProp;
    }

    const impt = systemJSPrototype.import;
    systemJSPrototype.import = function (id, parentUrl) {
      noteGlobalProps();
      return impt.call(this, id, parentUrl);
    };

    const emptyInstantiation = [[], function () { return {} }];

    const getRegister = systemJSPrototype.getRegister;
    systemJSPrototype.getRegister = function () {
      const lastRegister = getRegister.call(this);
      if (lastRegister)
        return lastRegister;
      
      // no registration -> attempt a global detection as difference from snapshot
      // when multiple globals, we take the global value to be the last defined new global object property
      // for performance, this will not support multi-version / global collisions as previous SystemJS versions did
      // note in Edge, deleting and re-adding a global does not change its ordering
      const globalProp = getGlobalProp();
      if (!globalProp)
        return emptyInstantiation;
      
      let globalExport;
      try {
        globalExport = global[globalProp];
      }
      catch (e) {
        return emptyInstantiation;
      }

      return [[], function (_export) {
        return { execute: function () { _export('default', globalExport); } };
      }];
    };

    })(typeof self !== 'undefined' ? self : global);

    /*
     * Loads WASM based on file extension detection
     * Assumes successive instantiate will handle other files
     */
    const instantiate = systemJSPrototype.instantiate;
    systemJSPrototype.instantiate = function (url, parent) {
      if (url.slice(-5) !== '.wasm')
        return instantiate.call(this, url, parent);
      
      return fetch(url)
      .then(function (res) {
        if (!res.ok)
          throw new Error(res.status + ' ' + res.statusText + ' ' + res.url + (parent ? ' loading from ' + parent : ''));

        if (WebAssembly.compileStreaming)
          return WebAssembly.compileStreaming(res);
        
        return res.arrayBuffer()
        .then(function (buf) {
          return WebAssembly.compile(buf);
        });
      })
      .then(function (module) {
        const deps = [];
        const setters = [];
        const importObj = {};

        // we can only set imports if supported (eg early Safari doesnt support)
        if (WebAssembly.Module.imports)
          WebAssembly.Module.imports(module).forEach(function (impt) {
            const key = impt.module;
            setters.push(function (m) {
              importObj[key] = m;
            });
            if (deps.indexOf(key) === -1)
              deps.push(key);
          });

        return [deps, function (_export) {
          return {
            setters: setters,
            execute: function () {
              return WebAssembly.instantiate(module, importObj)
              .then(function (instance) {
                _export(instance.exports);
              });
            }
          };
        }];
      });
    };

    /*
     * Package name map support for SystemJS
     * 
     * <script type="systemjs-packagemap">{}</script>
     * OR
     * <script type="systemjs-packagemap" src=package.json></script>
     * 
     * Only supports loading the first package map
     */

    let packageMapPromise, packageMapResolve;
    if (typeof document !== 'undefined') {
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (script.type !== 'systemjs-packagemap')
          continue;

        if (!script.src) {
          packageMapResolve = createPackageMap(JSON.parse(script.innerHTML), baseUrl);
          packageMapPromise = Promise.resolve();
        }
        else {
          packageMapPromise = fetch(script.src)
          .then(function (res) {
            return res.json();
          })
          .then(function (json) {
            packageMapResolve = createPackageMap(json, script.src);
            packageMapPromise = undefined;
          }, function () {
            packageMapResolve = throwBare;
            packageMapPromise = undefined;
          });
        }
        break;
      }
    }
    if (!packageMapPromise)
      packageMapResolve = throwBare;

    systemJSPrototype.resolve = function (id, parentUrl) {
      parentUrl = parentUrl || baseUrl;

      const resolvedIfNotPlainOrUrl = resolveIfNotPlainOrUrl(id, parentUrl);
      if (resolvedIfNotPlainOrUrl)
        return resolvedIfNotPlainOrUrl;
      if (id.indexOf(':') !== -1)
        return id;

      // now just left with plain
      // (if not package map, packageMapResolve just throws)
      if (packageMapPromise)
        return packageMapPromise
        .then(function () {
          return packageMapResolve(id, parentUrl);
        });

      return packageMapResolve(id, parentUrl);
    };

    systemJSPrototype.get = function (id) {
      const load = this[REGISTRY][id];
      if (load && load.e === null && !load.E) {
        if (load.eE)
          return null;
        return load.n;
      }
    };

    // Delete function provided for hot-reloading use cases
    systemJSPrototype.delete = function (id) {
      const load = this.get(id);
      if (load === undefined)
        return false;
      // remove from importerSetters
      // (release for gc)
      if (load && load.d)
        load.d.forEach(function (depLoad) {
          const importerIndex = depLoad.i.indexOf(load);
          if (importerIndex !== -1)
            depLoad.i.splice(importerIndex, 1);
        });
      return delete this[REGISTRY][id];
    };

  }());

  // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders#Example
  var getHeadersFromXHR = function getHeadersFromXHR(xhr) {
    var headersString = xhr.getAllResponseHeaders();

    if (headersString === "") {
      return {};
    }

    var lines = headersString.trim().split(/[\r\n]+/);
    var headerMap = {};
    lines.forEach(function (line) {
      var parts = line.split(": ");
      var name = parts.shift();
      var value = parts.join(": ");
      headerMap[name.toLowerCase()] = value;
    });
    return headerMap;
  };

  var normalizeXhr = function normalizeXhr(xhr) {
    return {
      status: xhr.status,
      reason: xhr.statusText,
      headers: getHeadersFromXHR(xhr),
      body: xhr.responseText
    };
  };

  var fetchUsingXHR = function fetchUsingXHR(url) {
    var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();

      xhr.ontimeout = function () {
        reject({
          name: "REQUEST_TIMEOUT_ERROR"
        });
      };

      xhr.onerror = function (error) {
        reject(error);
      };

      xhr.onload = function () {
        if (xhr.status === 0) {
          resolve(_objectSpread({}, normalizeXhr(xhr), {
            status: 200
          }));
          return;
        }

        resolve(_objectSpread({}, normalizeXhr(xhr)));
      };

      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) {
          return;
        } // in Chrome on file:/// URLs, status is 0


        if (xhr.status === 0) {
          if (xhr.responseText) {
            xhr.onload();
          }

          return;
        }

        resolve(normalizeXhr(xhr));
      };

      xhr.open("GET", url, true);
      Object.keys(headers).forEach(function (key) {
        xhr.setRequestHeader(key, headers[key]);
      });
      xhr.send(null);
    });
  };

  var getNamespaceToRegister = function getNamespaceToRegister(getNamespace) {
    return [[], function (_export) {
      return {
        execute: function execute() {
          _export(getNamespace());
        }
      };
    }];
  };

  var browserSystem = new window.System.constructor();

  browserSystem.instantiate = function (url, parent) {
    return fetchUsingXHR(url, {
      "x-module-referer": parent || url
    }).then(function (_ref) {
      var status = _ref.status,
          headers = _ref.headers,
          reason = _ref.reason,
          body = _ref.body;

      if (status < 200 || status >= 400) {
        return Promise.reject({
          status: status,
          reason: reason,
          headers: headers,
          body: body
        });
      }

      if (headers["content-type"] === "application/javascript") {
        body = "".concat(body, "\n", "//#", " sourceURL=").concat(url);

        try {
          window.eval(body);
        } catch (error) {
          return Promise.reject({
            code: "MODULE_INSTANTIATE_ERROR",
            error: error,
            url: url,
            parent: parent
          });
        }

        return browserSystem.getRegister();
      }

      if (headers["content-type"] === "application/json") {
        return getNamespaceToRegister(function () {
          return {
            default: JSON.parse(body)
          };
        });
      }

      return null;
    });
  };

  window.System = browserSystem;

  var createLocaters = function createLocaters(_ref) {
    var localRoot = _ref.localRoot,
        remoteRoot = _ref.remoteRoot,
        compileInto = _ref.compileInto,
        compileId = _ref.compileId;
    var remoteCompileRoot = "".concat(remoteRoot, "/").concat(compileInto, "/").concat(compileId);
    var remoteInstrumentRoot = "".concat(remoteRoot, "/").concat(compileInto, "/").concat(compileId, "-instrumented");

    var fileToRemoteCompiledFile = function fileToRemoteCompiledFile(file) {
      return "".concat(remoteCompileRoot, "/").concat(file);
    };

    var fileToRemoteInstrumentedFile = function fileToRemoteInstrumentedFile(file) {
      return "".concat(remoteInstrumentRoot, "/").concat(file);
    };

    var fileToRemoteSourceFile = function fileToRemoteSourceFile(file) {
      return "".concat(remoteRoot, "/").concat(file);
    };

    var fileToLocalFile = function fileToLocalFile(file) {
      return "".concat(localRoot, "/").concat(file);
    };

    var hrefToMeta = function hrefToMeta(href) {
      if (href.startsWith("".concat(remoteInstrumentRoot, "/"))) {
        return {
          type: "instrumented",
          file: href.slice(remoteInstrumentRoot.length + 1)
        };
      }

      if (href.startsWith("".concat(remoteCompileRoot, "/"))) {
        return {
          type: "compiled",
          file: href.slice(remoteCompileRoot.length + 1)
        };
      }

      if (href.startsWith("".concat(remoteRoot, "/").concat(compileInto))) {
        return {
          type: "compile-helper",
          file: href.slice(remoteRoot.length + 1)
        };
      }

      if (href.startsWith("".concat(remoteRoot, "/"))) {
        return {
          type: "source",
          file: href.slice(remoteRoot.length + 1)
        };
      }

      return {
        type: "other",
        file: href
      };
    };

    var hrefToFile = function hrefToFile(href) {
      return hrefToMeta(href).file;
    };

    var hrefToLocalFile = function hrefToLocalFile(href) {
      var _hrefToMeta = hrefToMeta(href),
          type = _hrefToMeta.type,
          file = _hrefToMeta.file;

      if (type === "instrumented") {
        return "".concat(localRoot, "/").concat(compileInto, "/").concat(compileId, "-instrumented/").concat(file);
      }

      if (type === "compiled") {
        return "".concat(localRoot, "/").concat(compileInto, "/").concat(compileId, "/").concat(file);
      }

      return "".concat(localRoot, "/").concat(file);
    };

    return {
      fileToRemoteCompiledFile: fileToRemoteCompiledFile,
      fileToRemoteInstrumentedFile: fileToRemoteInstrumentedFile,
      fileToRemoteSourceFile: fileToRemoteSourceFile,
      fileToLocalFile: fileToLocalFile,
      hrefToFile: hrefToFile,
      hrefToLocalFile: hrefToLocalFile
    };
  };

  var createImportTracker = function createImportTracker() {
    var importedMap = {};

    var markFileAsImported = function markFileAsImported(file) {
      importedMap[file] = true;
    };

    var isFileImported = function isFileImported(file) {
      return file in importedMap && importedMap[file] === true;
    };

    return {
      markFileAsImported: markFileAsImported,
      isFileImported: isFileImported
    };
  };

  var semver = function semver(version) {
    if (typeof version === "number") {
      return {
        major: version,
        minor: 0,
        patch: 0
      };
    }

    if (typeof version === "string") {
      if (version.indexOf(".") > -1) {
        var parts = version.split(".");
        return {
          major: Number(parts[0]),
          minor: parts[1] ? Number(parts[1]) : 0,
          patch: parts[2] ? Number(parts[2]) : 0
        };
      }

      if (isNaN(version)) {
        return {
          major: 0,
          minor: 0,
          patch: 0
        };
      }

      return {
        major: Number(version),
        minor: 0,
        patch: 0
      };
    }

    throw new TypeError("version must be a number or a string, got: ".concat(_typeof(version)));
  };

  var versionCompare = function versionCompare(versionA, versionB) {
    var semanticVersionA = semver(versionA);
    var semanticVersionB = semver(versionB);
    var majorDiff = semanticVersionA.major - semanticVersionB.major;

    if (majorDiff > 0) {
      return majorDiff;
    }

    if (majorDiff < 0) {
      return majorDiff;
    }

    var minorDiff = semanticVersionA.minor - semanticVersionB.minor;

    if (minorDiff > 0) {
      return minorDiff;
    }

    if (minorDiff < 0) {
      return minorDiff;
    }

    var patchDiff = semanticVersionA.patch - semanticVersionB.patch;

    if (patchDiff > 0) {
      return patchDiff;
    }

    if (patchDiff < 0) {
      return patchDiff;
    }

    return 0;
  };
  var versionEqual = function versionEqual(versionA, versionB) {
    return String(versionA) === String(versionB);
  };
  var versionIsBelow = function versionIsBelow(versionSupposedBelow, versionSupposedAbove) {
    return versionCompare(versionSupposedBelow, versionSupposedAbove) < 0;
  };
  var versionIsBelowOrEqual = function versionIsBelowOrEqual(versionSupposedBelow, versionSupposedAbove) {
    return versionEqual(versionSupposedBelow, versionSupposedAbove) || versionIsBelow(versionSupposedBelow, versionSupposedAbove);
  };

  var browserToCompileId = function browserToCompileId(_ref, compileMap) {
    var name = _ref.name,
        version = _ref.version;
    return Object.keys(compileMap).find(function (id) {
      var compatMap = compileMap[id].compatMap;

      if (name in compatMap === false) {
        return false;
      }

      var versionForGroup = compatMap[name];
      return versionIsBelowOrEqual(versionForGroup, version);
    });
  };

  var firstMatch = function firstMatch(regexp, string) {
    var match = string.match(regexp);
    return match && match.length > 0 ? match[1] || undefined : undefined;
  };
  var secondMatch = function secondMatch(regexp, string) {
    var match = string.match(regexp);
    return match && match.length > 1 ? match[2] || undefined : undefined;
  };
  var userAgentToVersion = function userAgentToVersion(userAgent) {
    return firstMatch(/version\/(\d+(\.?_?\d+)+)/i, userAgent) || undefined;
  };

  var navigatorToBrowser = function navigatorToBrowser(_ref) {
    var userAgent = _ref.userAgent,
        appVersion = _ref.appVersion;

    if (/(android)/i.test(userAgent)) {
      return {
        name: "android",
        version: firstMatch(/Android (\d+(\.?_?\d+)+)/i, appVersion)
      };
    }

    return null;
  };

  var detect = function detect() {
    return navigatorToBrowser(window.navigator);
  };

  var userAgentToBrowser = function userAgentToBrowser(userAgent) {
    if (/msie|trident/i.test(userAgent)) {
      return {
        name: "ie",
        version: firstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, userAgent)
      };
    }

    return null;
  };

  var detect$1 = function detect() {
    return userAgentToBrowser(window.navigator.userAgent);
  };

  var userAgentToBrowser$1 = function userAgentToBrowser(userAgent) {
    // opera below 13
    if (/opera/i.test(userAgent)) {
      return {
        name: "opera",
        version: userAgentToVersion(userAgent) || firstMatch(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i, userAgent)
      };
    } // opera above 13


    if (/opr\/|opios/i.test(userAgent)) {
      return {
        name: "opera",
        version: firstMatch(/(?:opr|opios)[\s/](\S+)/i, userAgent) || userAgentToVersion(userAgent)
      };
    }

    return null;
  };

  var detect$2 = function detect() {
    return userAgentToBrowser$1(window.navigator.userAgent);
  };

  var userAgentToBrowser$2 = function userAgentToBrowser(userAgent) {
    if (/edg([ea]|ios)/i.test(userAgent)) {
      return {
        name: "edge",
        version: secondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, userAgent)
      };
    }

    return null;
  };

  var detect$3 = function detect() {
    return userAgentToBrowser$2(window.navigator.userAgent);
  };

  var userAgentToBrowser$3 = function userAgentToBrowser(userAgent) {
    if (/firefox|iceweasel|fxios/i.test(userAgent)) {
      return {
        name: "firefox",
        version: firstMatch(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i, userAgent)
      };
    }

    return null;
  };

  var detect$4 = function detect() {
    return userAgentToBrowser$3(window.navigator.userAgent);
  };

  var userAgentToBrowser$4 = function userAgentToBrowser(userAgent) {
    if (/chromium/i.test(userAgent)) {
      return {
        name: "chrome",
        version: firstMatch(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i, userAgent) || userAgentToVersion(userAgent)
      };
    }

    if (/chrome|crios|crmo/i.test(userAgent)) {
      return {
        name: "chrome",
        version: firstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, userAgent)
      };
    }

    return null;
  };

  var detect$5 = function detect() {
    return userAgentToBrowser$4(window.navigator.userAgent);
  };

  var userAgentToBrowser$5 = function userAgentToBrowser(userAgent) {
    if (/safari|applewebkit/i.test(userAgent)) {
      return {
        name: "safari",
        version: userAgentToVersion(userAgent)
      };
    }

    return null;
  };

  var detect$6 = function detect() {
    return userAgentToBrowser$5(window.navigator.userAgent);
  };

  var detect$7 = function detect() {
    return null;
  }; // TODO

  var navigatorToBrowser$1 = function navigatorToBrowser(_ref) {
    var userAgent = _ref.userAgent,
        appVersion = _ref.appVersion;

    if (/iPhone;/.test(userAgent)) {
      return {
        name: "ios",
        version: firstMatch(/OS (\d+(\.?_?\d+)+)/i, appVersion)
      };
    }

    if (/iPad;/.test(userAgent)) {
      return {
        name: "ios",
        version: firstMatch(/OS (\d+(\.?_?\d+)+)/i, appVersion)
      };
    }

    return null;
  };

  var detect$8 = function detect() {
    return navigatorToBrowser$1(window.navigator);
  };

  // https://github.com/Ahmdrza/detect-browser/blob/26254f85cf92795655a983bfd759d85f3de850c6/detect-browser.js#L1

  var detectorCompose = function detectorCompose(detectors) {
    return function () {
      var i = 0;

      while (i < detectors.length) {
        var _detector = detectors[i];
        i++;

        var result = _detector();

        if (result) {
          return result;
        }
      }

      return null;
    };
  };

  var detector = detectorCompose([detect$2, detect$1, detect$3, detect$4, detect$5, detect$6, detect$7, detect$8, detect]);

  var normalizeName = function normalizeName(name) {
    return name.toLowerCase();
  };

  var normalizeVersion = function normalizeVersion(version) {
    if (version.indexOf(".") > -1) {
      var parts = version.split("."); // remove extraneous .

      return parts.slice(0, 3).join(".");
    }

    if (version.indexOf("_") > -1) {
      var _parts = version.split("_"); // remove extraneous _


      return _parts.slice(0, 3).join("_");
    }

    return version;
  };

  var detect$9 = function detect$$1() {
    var _ref = detector() || {},
        _ref$name = _ref.name,
        name = _ref$name === void 0 ? "other" : _ref$name,
        _ref$version = _ref.version,
        version = _ref$version === void 0 ? "unknown" : _ref$version;

    return {
      name: normalizeName(name),
      version: normalizeVersion(version)
    };
  };

  var open = function open(url, callback) {
    if (typeof window.EventSource !== "function") {
      return function () {};
    }

    var eventSource = new window.EventSource(url, {
      withCredentials: true
    });

    var close = function close() {
      eventSource.close();
    };

    eventSource.onerror = function () {
      // we could try to reconnect several times before giving up
      // but dont keep it open as it would try to reconnect forever
      // maybe, it depends what error occurs, or we could
      // retry less frequently
      close();
    };

    eventSource.addEventListener("file-changed", function (e) {
      if (e.origin !== url) {
        return;
      }

      var fileChanged = e.data;
      callback(fileChanged);
    });
    return close;
  };

  var link = function link(url) {
    var text = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : url;
    return "<a href=\"".concat(url, "\">").concat(text, "</a>");
  }; // `Error: yo
  // at Object.execute (http://127.0.0.1:57300/build/src/__test__/file-throw.js:9:13)
  // at doExec (http://127.0.0.1:3000/src/__test__/file-throw.js:452:38)
  // at postOrderExec (http://127.0.0.1:3000/src/__test__/file-throw.js:448:16)
  // at http://127.0.0.1:3000/src/__test__/file-throw.js:399:18`.replace(/(?:https?|ftp|file):\/\/(.*+)$/gm, (...args) => {
  //   debugger
  // })

  var stringToStringWithLink = function stringToStringWithLink(source) {
    return source.replace(/(?:https?|ftp|file):\/\/.*?$/gm, function (match) {
      // remove lineNumber. columnNumber and possible last ) from url
      var url = match.replace(/(?::[0-9]+)?:[0-9]*\)?$/, ""); // const sourceURL = url.replace(`${remoteRoot}/${remoteCompileDestination}`, remoteRoot)

      return link(url, match);
    });
  };

  var parseErrorToMeta = function parseErrorToMeta(error, _ref) {
    var fileToRemoteSourceFile = _ref.fileToRemoteSourceFile;
    var parseError = JSON.parse(error.body);
    var file = parseError.fileName;
    var message = parseError.message;
    var data = message.replace(file, link("".concat(fileToRemoteSourceFile(file)), file));
    return {
      file: file,
      data: data
    };
  };

  var errorToMeta = function errorToMeta(error) {
    return {
      data: stringToStringWithLink(error.stack)
    };
  };

  var rejectionValueToMeta = function rejectionValueToMeta(error, _ref2) {
    var fileToRemoteSourceFile = _ref2.fileToRemoteSourceFile,
        hrefToFile = _ref2.hrefToFile;

    if (error && error.status === 500 && error.reason === "parse error") {
      return parseErrorToMeta(error, {
        fileToRemoteSourceFile: fileToRemoteSourceFile
      });
    }

    if (error && error.code === "MODULE_INSTANTIATE_ERROR") {
      var file = hrefToFile(error.url);
      var originalError = error.error;
      return {
        file: file,
        // eslint-disable-next-line no-use-before-define
        data: rejectionValueToMeta(originalError, {
          fileToRemoteSourceFile: fileToRemoteSourceFile,
          hrefToFile: hrefToFile
        })
      };
    }

    if (error && error instanceof Error) {
      return errorToMeta(error);
    }

    return {
      data: JSON.stringify(error)
    };
  };

  var createBrowserPlatform = function createBrowserPlatform(_ref) {
    var remoteRoot = _ref.remoteRoot,
        compileInto = _ref.compileInto,
        compileMap = _ref.compileMap,
        _ref$hotreload = _ref.hotreload,
        hotreload = _ref$hotreload === void 0 ? false : _ref$hotreload,
        hotreloadSSERoot = _ref.hotreloadSSERoot,
        hotreloadCallback = _ref.hotreloadCallback;

    if (_typeof(compileMap) !== "object") {
      throw new TypeError("createBrowserPlatform compileMap must be an object, got ".concat(compileMap));
    }

    var browser = detect$9();
    var compileId = browserToCompileId(browser, compileMap) || "otherwise";

    var _createLocaters = createLocaters({
      remoteRoot: remoteRoot,
      compileInto: compileInto,
      compileId: compileId
    }),
        fileToRemoteCompiledFile = _createLocaters.fileToRemoteCompiledFile,
        fileToRemoteInstrumentedFile = _createLocaters.fileToRemoteInstrumentedFile,
        fileToRemoteSourceFile = _createLocaters.fileToRemoteSourceFile,
        hrefToFile = _createLocaters.hrefToFile;

    var _createImportTracker = createImportTracker(),
        markFileAsImported = _createImportTracker.markFileAsImported,
        isFileImported = _createImportTracker.isFileImported;

    if (hotreload) {
      var hotreloadPredicate = function hotreloadPredicate(file) {
        // isFileImported is useful in case the file was imported but is not
        // in System registry because it has a parse error or insantiate error
        if (isFileImported(file)) {
          return true;
        }

        var remoteCompiledFile = fileToRemoteCompiledFile(file);
        return Boolean(window.System.get(remoteCompiledFile));
      };

      open(hotreloadSSERoot, function (file) {
        if (hotreloadPredicate(file)) {
          hotreloadCallback({
            file: file
          });
        }
      });
    }

    var executeFile = function executeFile(_ref2) {
      var file = _ref2.file,
          _ref2$instrument = _ref2.instrument,
          instrument = _ref2$instrument === void 0 ? false : _ref2$instrument,
          _ref2$setup = _ref2.setup,
          setup = _ref2$setup === void 0 ? function () {} : _ref2$setup,
          _ref2$teardown = _ref2.teardown,
          teardown = _ref2$teardown === void 0 ? function () {} : _ref2$teardown;
      markFileAsImported(file);
      var remoteCompiledFile = instrument ? fileToRemoteCompiledFile(file) : fileToRemoteInstrumentedFile(file);
      return Promise.resolve().then(setup).then(function () {
        return window.System.import(remoteCompiledFile);
      }).catch(function (error) {
        var meta = rejectionValueToMeta(error, {
          fileToRemoteSourceFile: fileToRemoteSourceFile,
          hrefToFile: hrefToFile
        });
        document.body.innerHTML = "<h1><a href=\"".concat(fileToRemoteSourceFile(file), "\">").concat(file, "</a> import rejected</h1>\n\t\t<pre style=\"border: 1px solid black\">").concat(meta.data, "</pre>");
        return Promise.reject(error);
      }).then(teardown);
    };

    return {
      executeFile: executeFile
    };
  };

  exports.createBrowserPlatform = createBrowserPlatform;

  return exports;

}({}));

//# sourceMappingURL=browser-platform.js.map