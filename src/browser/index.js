var createBrowserLoader = (function (exports) {
'use strict';

var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
var isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
var isWindows = typeof process !== 'undefined' && typeof process.platform === 'string' && process.platform.match(/^win/);

var envGlobal = typeof self !== 'undefined' ? self : global;

var hasSymbol = typeof Symbol !== 'undefined';
function createSymbol(name) {
  return hasSymbol ? Symbol() : '@@' + name;
}

var baseURI;

if (typeof document != 'undefined' && document.getElementsByTagName) {
  baseURI = document.baseURI;

  if (!baseURI) {
    var bases = document.getElementsByTagName('base');
    baseURI = bases[0] && bases[0].href || window.location.href;
  }
} else if (typeof location != 'undefined') {
  baseURI = location.href;
}

if (baseURI) {
  baseURI = baseURI.split('#')[0].split('?')[0];
  baseURI = baseURI.substr(0, baseURI.lastIndexOf('/') + 1);
} else if (typeof process != 'undefined' && process.cwd) {
  baseURI = 'file://' + (isWindows ? '/' : '') + process.cwd();
  if (isWindows) baseURI = baseURI.replace(/\\/g, '/');
} else {
  throw new TypeError('No environment baseURI');
}

if (baseURI[baseURI.length - 1] !== '/') baseURI += '/';

var errArgs = new Error(0, '_').fileName == '_';
function LoaderError__Check_error_message_for_loader_stack(childErr, newMessage) {
  if (!isBrowser) newMessage = newMessage.replace(isWindows ? /file:\/\/\//g : /file:\/\//g, '');

  var message = (childErr.message || childErr) + '\n  ' + newMessage;

  var err;
  if (errArgs && childErr.fileName) err = new Error(message, childErr.fileName, childErr.lineNumber);else err = new Error(message);

  var stack = childErr.originalErr ? childErr.originalErr.stack : childErr.stack;

  if (isNode) err.stack = message + '\n  ' + stack;else err.stack = stack;

  err.originalErr = childErr.originalErr || childErr;

  return err;
}

var resolvedPromise = Promise.resolve();

function arrayValues(arr) {
  if (arr.values) return arr.values();

  if (typeof Symbol === 'undefined' || !Symbol.iterator) throw new Error('Symbol.iterator not supported in this browser');

  var iterable = {};
  iterable[Symbol.iterator] = function () {
    var keys = Object.keys(arr);
    var keyIndex = 0;
    return {
      next: function next() {
        if (keyIndex < keys.length) return {
          value: arr[keys[keyIndex++]],
          done: false
        };else return {
          value: undefined,
          done: true
        };
      }
    };
  };
  return iterable;
}

function Loader() {
  this.registry = new Registry();
}

Loader.prototype.constructor = Loader;

function ensureInstantiated(module) {
  if (!(module instanceof ModuleNamespace)) throw new TypeError('Module instantiation did not return a valid namespace object.');
  return module;
}

Loader.prototype['import'] = function (key, parent) {
  if (typeof key !== 'string') throw new TypeError('Loader import method must be passed a module key string');

  var loader = this;
  return resolvedPromise.then(function () {
    return loader[RESOLVE_INSTANTIATE](key, parent);
  }).then(ensureInstantiated)['catch'](function (err) {
    throw LoaderError__Check_error_message_for_loader_stack(err, 'Loading ' + key + (parent ? ' from ' + parent : ''));
  });
};

var RESOLVE = Loader.resolve = createSymbol('resolve');

var RESOLVE_INSTANTIATE = Loader.resolveInstantiate = createSymbol('resolveInstantiate');

Loader.prototype[RESOLVE_INSTANTIATE] = function (key, parent) {
  var loader = this;
  return loader.resolve(key, parent).then(function (resolved) {
    return loader.registry.get(resolved);
  });
};

function ensureResolution(resolvedKey) {
  if (resolvedKey === undefined) throw new RangeError('No resolution found.');
  return resolvedKey;
}

Loader.prototype.resolve = function (key, parent) {
  var loader = this;
  return resolvedPromise.then(function () {
    return loader[RESOLVE](key, parent);
  }).then(ensureResolution)['catch'](function (err) {
    throw LoaderError__Check_error_message_for_loader_stack(err, 'Resolving ' + key + (parent ? ' to ' + parent : ''));
  });
};

var iteratorSupport = typeof Symbol !== 'undefined' && Symbol.iterator;
var REGISTRY = createSymbol('registry');
function Registry() {
  this[REGISTRY] = {};
  this._registry = REGISTRY;
}

if (iteratorSupport) {
  Registry.prototype[Symbol.iterator] = function () {
    return this.entries()[Symbol.iterator]();
  };

  Registry.prototype.entries = function () {
    var registry = this[REGISTRY];
    return arrayValues(Object.keys(registry).map(function (key) {
      return [key, registry[key]];
    }));
  };
}

Registry.prototype.keys = function () {
  return arrayValues(Object.keys(this[REGISTRY]));
};

Registry.prototype.values = function () {
  var registry = this[REGISTRY];
  return arrayValues(Object.keys(registry).map(function (key) {
    return registry[key];
  }));
};

Registry.prototype.get = function (key) {
  return this[REGISTRY][key];
};

Registry.prototype.set = function (key, namespace) {
  if (!(namespace instanceof ModuleNamespace)) throw new Error('Registry must be set with an instance of Module Namespace');
  this[REGISTRY][key] = namespace;
  return this;
};

Registry.prototype.has = function (key) {
  return Object.hasOwnProperty.call(this[REGISTRY], key);
};

Registry.prototype['delete'] = function (key) {
  if (Object.hasOwnProperty.call(this[REGISTRY], key)) {
    delete this[REGISTRY][key];
    return true;
  }
  return false;
};

var BASE_OBJECT = createSymbol('baseObject');

function ModuleNamespace(baseObject) {
  Object.defineProperty(this, BASE_OBJECT, {
    value: baseObject
  });

  Object.keys(baseObject).forEach(extendNamespace, this);
}
ModuleNamespace.prototype = Object.create(null);

if (typeof Symbol !== 'undefined' && Symbol.toStringTag) Object.defineProperty(ModuleNamespace.prototype, Symbol.toStringTag, {
  value: 'Module'
});

function extendNamespace(key) {
  Object.defineProperty(this, key, {
    enumerable: true,
    get: function get() {
      return this[BASE_OBJECT][key];
    }
  });
}

function throwResolveError() {
  throw new RangeError('Unable to resolve "' + relUrl + '" to ' + parentUrl);
}
function resolveIfNotPlain(relUrl, parentUrl) {
  var parentProtocol = parentUrl && parentUrl.substr(0, parentUrl.indexOf(':') + 1);

  var firstChar = relUrl[0];
  var secondChar = relUrl[1];

  if (firstChar === '/' && secondChar === '/') {
    if (!parentProtocol) throwResolveError(relUrl, parentUrl);
    return parentProtocol + relUrl;
  } else if (firstChar === '.' && (secondChar === '/' || secondChar === '.' && (relUrl[2] === '/' || relUrl.length === 2) || relUrl.length === 1) || firstChar === '/') {
      var parentIsPlain = !parentProtocol || parentUrl[parentProtocol.length] !== '/';

      var pathname;
      if (parentIsPlain) {
        if (parentUrl === undefined) throwResolveError(relUrl, parentUrl);
        pathname = parentUrl;
      } else if (parentUrl[parentProtocol.length + 1] === '/') {
        if (parentProtocol !== 'file:') {
          pathname = parentUrl.substr(parentProtocol.length + 2);
          pathname = pathname.substr(pathname.indexOf('/') + 1);
        } else {
          pathname = parentUrl.substr(8);
        }
      } else {
        pathname = parentUrl.substr(parentProtocol.length + 1);
      }

      if (firstChar === '/') {
        if (parentIsPlain) throwResolveError(relUrl, parentUrl);else return parentUrl.substr(0, parentUrl.length - pathname.length - 1) + relUrl;
      }

      var segmented = pathname.substr(0, pathname.lastIndexOf('/') + 1) + relUrl;

      var output = [];
      var segmentIndex = undefined;

      for (var i = 0; i < segmented.length; i++) {
        if (segmentIndex !== undefined) {
          if (segmented[i] === '/') {
            output.push(segmented.substr(segmentIndex, i - segmentIndex + 1));
            segmentIndex = undefined;
          }
          continue;
        }

        if (segmented[i] === '.') {
          if (segmented[i + 1] === '.' && (segmented[i + 2] === '/' || i === segmented.length - 2)) {
            output.pop();
            i += 2;
          } else if (segmented[i + 1] === '/' || i === segmented.length - 1) {
              i += 1;
            } else {
              segmentIndex = i;
              continue;
            }

          if (parentIsPlain && output.length === 0) throwResolveError(relUrl, parentUrl);

          if (i === segmented.length) output.push('');
          continue;
        }

        segmentIndex = i;
      }

      if (segmentIndex !== undefined) output.push(segmented.substr(segmentIndex, segmented.length - segmentIndex));

      return parentUrl.substr(0, parentUrl.length - pathname.length) + output.join('');
    }

  var protocolIndex = relUrl.indexOf(':');
  if (protocolIndex !== -1) {
    if (isNode) {
      if (relUrl[1] === ':' && relUrl[2] === '\\' && relUrl[0].match(/[a-z]/i)) return 'file:///' + relUrl.replace(/\\/g, '/');
    }
    return relUrl;
  }
}

var REGISTER_INTERNAL = createSymbol('register-internal');

function RegisterLoader() {
  Loader.call(this);

  this[REGISTER_INTERNAL] = {
    lastRegister: undefined,

    records: {}
  };

  this.trace = false;
}

RegisterLoader.prototype = Object.create(Loader.prototype);
RegisterLoader.prototype.constructor = RegisterLoader;

var INSTANTIATE = RegisterLoader.instantiate = createSymbol('instantiate');

RegisterLoader.prototype[RegisterLoader.resolve = Loader.resolve] = function (key, parentKey) {
  return resolveIfNotPlain(key, parentKey || baseURI);
};

RegisterLoader.prototype[INSTANTIATE] = function (key, processAnonRegister) {};

function createLoadRecord(state, key, registration) {
  return state.records[key] = {
    key: key,

    registration: registration,

    module: undefined,

    importerSetters: undefined,

    linkRecord: {
      instantiatePromise: undefined,
      dependencies: undefined,
      execute: undefined,
      executingRequire: false,

      moduleObj: undefined,

      setters: undefined,

      depsInstantiatePromise: undefined,

      dependencyInstantiations: undefined,

      linked: false,

      error: undefined
    }
  };
}

RegisterLoader.prototype[Loader.resolveInstantiate] = function (key, parentKey) {
  var loader = this;
  var state = this[REGISTER_INTERNAL];
  var registry = loader.registry[loader.registry._registry];

  return resolveInstantiate(loader, key, parentKey, registry, state).then(function (instantiated) {
    if (instantiated instanceof ModuleNamespace) return instantiated;

    if (instantiated.module) return instantiated.module;

    if (instantiated.linkRecord.linked) return ensureEvaluate(loader, instantiated, instantiated.linkRecord, registry, state, undefined);

    return instantiateDeps(loader, instantiated, instantiated.linkRecord, registry, state, [instantiated]).then(function () {
      return ensureEvaluate(loader, instantiated, instantiated.linkRecord, registry, state, undefined);
    })['catch'](function (err) {
      clearLoadErrors(loader, instantiated);
      throw err;
    });
  });
};

function resolveInstantiate(loader, key, parentKey, registry, state) {
  var module = registry[key];
  if (module) return Promise.resolve(module);

  var load = state.records[key];

  if (load && !load.module) return instantiate(loader, load, load.linkRecord, registry, state);

  return loader.resolve(key, parentKey).then(function (resolvedKey) {
    module = registry[resolvedKey];
    if (module) return module;

    load = state.records[resolvedKey];

    if (!load || load.module) load = createLoadRecord(state, resolvedKey, load && load.registration);

    var link = load.linkRecord;
    if (!link) return load;

    return instantiate(loader, load, link, registry, state);
  });
}

function createProcessAnonRegister(loader, load, state) {
  return function () {
    var lastRegister = state.lastRegister;

    if (!lastRegister) return !!load.registration;

    state.lastRegister = undefined;
    load.registration = lastRegister;

    return true;
  };
}

function instantiate(loader, load, link, registry, state) {
  return link.instantiatePromise || (link.instantiatePromise = (load.registration ? Promise.resolve() : Promise.resolve().then(function () {
    state.lastRegister = undefined;
    return loader[INSTANTIATE](load.key, loader[INSTANTIATE].length > 1 && createProcessAnonRegister(loader, load, state));
  })).then(function (instantiation) {
    if (instantiation !== undefined) {
      if (!(instantiation instanceof ModuleNamespace)) throw new TypeError('Instantiate did not return a valid Module object.');

      delete state.records[load.key];
      if (loader.trace) traceLoad(loader, load, link);
      return registry[load.key] = instantiation;
    }

    var registration = load.registration;

    load.registration = undefined;
    if (!registration) throw new TypeError('Module instantiation did not call an anonymous or correctly named System.register.');

    link.dependencies = registration[0];

    load.importerSetters = [];

    link.moduleObj = {};

    if (registration[2]) {
      link.moduleObj['default'] = {};
      link.moduleObj.__useDefault = true;
      link.executingRequire = registration[1];
      link.execute = registration[2];
    } else {
        registerDeclarative(loader, load, link, registration[1]);
      }

    if (!link.dependencies.length) {
      link.linked = true;
      if (loader.trace) traceLoad(loader, load, link);
    }

    return load;
  })['catch'](function (err) {
    throw link.error = LoaderError__Check_error_message_for_loader_stack(err, 'Instantiating ' + load.key);
  }));
}

function resolveInstantiateDep(loader, key, parentKey, registry, state, traceDepMap) {
  return loader.resolve(key, parentKey).then(function (resolvedKey) {
    if (traceDepMap) traceDepMap[key] = key;

    var load = state.records[resolvedKey];
    var module = registry[resolvedKey];

    if (module && (!load || load.module && module !== load.module)) return module;

    if (!load || !module && load.module) load = createLoadRecord(state, resolvedKey, load && load.registration);

    var link = load.linkRecord;
    if (!link) return load;

    return instantiate(loader, load, link, registry, state);
  });
}

function traceLoad(loader, load, link) {
  loader.loads = loader.loads || {};
  loader.loads[load.key] = {
    key: load.key,
    deps: link.dependencies,
    depMap: link.depMap || {}
  };
}

function registerDeclarative(loader, load, link, declare) {
  var moduleObj = link.moduleObj;
  var importerSetters = load.importerSetters;

  var locked = false;

  var declared = declare.call(envGlobal, function (name, value) {
    if (locked) return;

    if (typeof name === 'object') {
      for (var p in name) {
        if (p !== '__useDefault') moduleObj[p] = name[p];
      }
    } else {
      moduleObj[name] = value;
    }

    locked = true;
    for (var i = 0; i < importerSetters.length; i++) {
      importerSetters[i](moduleObj);
    }locked = false;

    return value;
  }, new ContextualLoader(loader, load.key));

  link.setters = declared.setters;
  link.execute = declared.execute;
  if (declared.exports) link.moduleObj = moduleObj = declared.exports;
}

function instantiateDeps(loader, load, link, registry, state, seen) {
  return (link.depsInstantiatePromise || (link.depsInstantiatePromise = Promise.resolve().then(function () {
    var depsInstantiatePromises = Array(link.dependencies.length);

    for (var i = 0; i < link.dependencies.length; i++) {
      depsInstantiatePromises[i] = resolveInstantiateDep(loader, link.dependencies[i], load.key, registry, state, loader.trace && (link.depMap = {}));
    }return Promise.all(depsInstantiatePromises);
  }).then(function (dependencyInstantiations) {
    link.dependencyInstantiations = dependencyInstantiations;

    if (link.setters) {
      for (var i = 0; i < dependencyInstantiations.length; i++) {
        var setter = link.setters[i];
        if (setter) {
          var instantiation = dependencyInstantiations[i];

          if (instantiation instanceof ModuleNamespace) {
            setter(instantiation);
          } else {
            setter(instantiation.module || instantiation.linkRecord.moduleObj);

            if (instantiation.importerSetters) instantiation.importerSetters.push(setter);
          }
        }
      }
    }
  }))).then(function () {
    var deepDepsInstantiatePromises = [];

    for (var i = 0; i < link.dependencies.length; i++) {
      var depLoad = link.dependencyInstantiations[i];
      var depLink = depLoad.linkRecord;

      if (!depLink || depLink.linked) continue;

      if (seen.indexOf(depLoad) !== -1) continue;
      seen.push(depLoad);

      deepDepsInstantiatePromises.push(instantiateDeps(loader, depLoad, depLoad.linkRecord, registry, state, seen));
    }

    return Promise.all(deepDepsInstantiatePromises);
  }).then(function () {
    link.linked = true;
    if (loader.trace) traceLoad(loader, load, link);

    return load;
  })['catch'](function (err) {
    err = LoaderError__Check_error_message_for_loader_stack(err, 'Loading ' + load.key);

    link.error = link.error || err;

    throw err;
  });
}

function clearLoadErrors(loader, load) {
  var state = loader[REGISTER_INTERNAL];

  if (state.records[load.key] === load) delete state.records[load.key];

  var link = load.linkRecord;

  if (!link) return;

  if (link.dependencyInstantiations) link.dependencyInstantiations.forEach(function (depLoad, index) {
    if (!depLoad || depLoad instanceof ModuleNamespace) return;

    if (depLoad.linkRecord) {
      if (depLoad.linkRecord.error) {
        if (state.records[depLoad.key] === depLoad) clearLoadErrors(loader, depLoad);
      }

      if (link.setters && depLoad.importerSetters) {
        var setterIndex = depLoad.importerSetters.indexOf(link.setters[index]);
        depLoad.importerSetters.splice(setterIndex, 1);
      }
    }
  });
}

RegisterLoader.prototype.register = function (key, deps, declare) {
  var state = this[REGISTER_INTERNAL];

  if (declare === undefined) {
    state.lastRegister = [key, deps, undefined];
  } else {
      var load = state.records[key] || createLoadRecord(state, key, undefined);
      load.registration = [deps, declare, undefined];
    }
};

RegisterLoader.prototype.registerDynamic = function (key, deps, executingRequire, execute) {
  var state = this[REGISTER_INTERNAL];

  if (typeof key !== 'string') {
    state.lastRegister = [key, deps, executingRequire];
  } else {
      var load = state.records[key] || createLoadRecord(state, key, undefined);
      load.registration = [deps, executingRequire, execute];
    }
};

function ContextualLoader(loader, key) {
  this.loader = loader;
  this.key = this.id = key;
}
ContextualLoader.prototype.constructor = function () {
  throw new TypeError('Cannot subclass the contextual loader only Reflect.Loader.');
};
ContextualLoader.prototype['import'] = function (key) {
  return this.loader['import'](key, this.key);
};
ContextualLoader.prototype.resolve = function (key) {
  return this.loader.resolve(key, this.key);
};
ContextualLoader.prototype.load = function (key) {
  return this.loader.load(key, this.key);
};

function ensureEvaluate(loader, load, link, registry, state, seen) {
  if (load.module) return load.module;

  if (link.error) throw link.error;

  if (seen && seen.indexOf(load) !== -1) return load.linkRecord.moduleObj;

  var err = doEvaluate(loader, load, link, registry, state, link.setters ? [] : seen || []);
  if (err) {
    clearLoadErrors(loader, load);
    throw err;
  }

  return load.module;
}

function makeDynamicRequire(loader, key, dependencies, dependencyInstantiations, registry, state, seen) {
  return function (name) {
    for (var i = 0; i < dependencies.length; i++) {
      if (dependencies[i] === name) {
        var depLoad = dependencyInstantiations[i];
        var module;

        if (depLoad instanceof ModuleNamespace) module = depLoad;else module = ensureEvaluate(loader, depLoad, depLoad.linkRecord, registry, state, seen);

        return module.__useDefault ? module['default'] : module;
      }
    }
    throw new Error('Module ' + name + ' not declared as a System.registerDynamic dependency of ' + key);
  };
}

function doEvaluate(loader, load, link, registry, state, seen) {
  seen.push(load);

  var err;

  if (link.setters) {
    var depLoad, depLink;
    for (var i = 0; i < link.dependencies.length; i++) {
      depLoad = link.dependencyInstantiations[i];

      if (depLoad instanceof ModuleNamespace) continue;

      depLink = depLoad.linkRecord;
      if (depLink && seen.indexOf(depLoad) === -1) {
        if (depLink.error) err = depLink.error;else err = doEvaluate(loader, depLoad, depLink, registry, state, depLink.setters ? seen : []);
      }

      if (err) return link.error = LoaderError__Check_error_message_for_loader_stack(err, 'Evaluating ' + load.key);
    }
  }

  if (link.execute) {
    if (link.setters) {
      err = declarativeExecute(link.execute);
    } else {
        var module = { id: load.key };
        var moduleObj = link.moduleObj;
        Object.defineProperty(module, 'exports', {
          configurable: true,
          set: function set(exports) {
            moduleObj['default'] = exports;
          },
          get: function get() {
            return moduleObj['default'];
          }
        });

        var require = makeDynamicRequire(loader, load.key, link.dependencies, link.dependencyInstantiations, registry, state, seen);

        if (!link.executingRequire) for (var i = 0; i < link.dependencies.length; i++) {
          require(link.dependencies[i]);
        }err = dynamicExecute(link.execute, require, moduleObj['default'], module);

        if (module.exports !== moduleObj['default']) moduleObj['default'] = module.exports;

        if (moduleObj['default'] && moduleObj['default'].__esModule) for (var p in moduleObj['default']) {
          if (Object.hasOwnProperty.call(moduleObj['default'], p) && p !== 'default') moduleObj[p] = moduleObj['default'][p];
        }
      }
  }

  if (err) return link.error = LoaderError__Check_error_message_for_loader_stack(err, 'Evaluating ' + load.key);

  registry[load.key] = load.module = new ModuleNamespace(link.moduleObj);

  if (!link.setters) {
    if (load.importerSetters) for (var i = 0; i < load.importerSetters.length; i++) {
      load.importerSetters[i](load.module);
    }load.importerSetters = undefined;
  }

  load.linkRecord = undefined;
}

var nullContext = {};
if (Object.freeze) Object.freeze(nullContext);

function declarativeExecute(execute) {
  try {
    execute.call(nullContext);
  } catch (e) {
    return e;
  }
}

function dynamicExecute(execute, require, exports, module) {
  try {
    var output = execute.call(envGlobal, require, exports, module);
    if (output !== undefined) module.exports = output;
  } catch (e) {
    return e;
  }
}

var createLoader = function createLoader() {
	var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	    base = _ref.base,
	    _ref$resolve = _ref.resolve,
	    resolve = _ref$resolve === undefined ? RegisterLoader.prototype[RegisterLoader.resolve] : _ref$resolve,
	    _ref$instantiate = _ref.instantiate,
	    instantiate = _ref$instantiate === undefined ? RegisterLoader.prototype[RegisterLoader.instantiate] : _ref$instantiate;

	var loader = new RegisterLoader();

	if (base) {
		base = resolveIfNotPlain(base, baseURI) || resolveIfNotPlain("./" + base, baseURI);
	} else {
		base = baseURI;
	}

	if (base[base.length - 1] !== "/") {
		base += "/";
	}

	loader[RegisterLoader.resolve] = function (key) {
		var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : base;

		return resolve.call(this, key, parent) || key;
	};

	loader[RegisterLoader.instantiate] = instantiate;

	return loader;
};

var createBrowserLoader = function createBrowserLoader() {
	var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	    base = _ref.base;

	return createLoader({ base: base });
};

exports.createBrowserLoader = createBrowserLoader;

return exports;

}({}));

//# sourceURL=/createLoader.js
//# sourceMappingURL=/index.js.map