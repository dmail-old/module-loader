'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var https = _interopDefault(require('https'));
var fs = _interopDefault(require('fs'));
var Module = _interopDefault(require('module'));
var repl = _interopDefault(require('repl'));

var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
var isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
var isWindows = typeof process !== 'undefined' && typeof process.platform === 'string' && process.platform.match(/^win/);

var envGlobal = typeof self !== 'undefined' ? self : global;

var hasSymbol = typeof Symbol !== 'undefined';
function createSymbol(name) {
  return hasSymbol ? Symbol() : '@@' + name;
}

function fileUrlToPath(fileUrl) {
  if (fileUrl.substr(0, 7) !== 'file://') throw new RangeError(fileUrl + ' is not a valid file url');
  if (isWindows) return fileUrl.substr(8).replace(/\\/g, '/');else return fileUrl.substr(7);
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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BUFFER = Symbol('buffer');
var TYPE = Symbol('type');

var Blob = function () {
	function Blob() {
		_classCallCheck(this, Blob);

		this[TYPE] = '';

		var blobParts = arguments[0];
		var options = arguments[1];

		var buffers = [];

		if (blobParts) {
			var a = blobParts;
			var length = Number(a.length);
			for (var i = 0; i < length; i++) {
				var element = a[i];
				var buffer = void 0;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		var type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}

	_createClass(Blob, [{
		key: 'slice',
		value: function slice() {
			var size = this.size;

			var start = arguments[0];
			var end = arguments[1];
			var relativeStart = void 0,
			    relativeEnd = void 0;
			if (start === undefined) {
				relativeStart = 0;
			} else if (start < 0) {
				relativeStart = Math.max(size + start, 0);
			} else {
				relativeStart = Math.min(start, size);
			}
			if (end === undefined) {
				relativeEnd = size;
			} else if (end < 0) {
				relativeEnd = Math.max(size + end, 0);
			} else {
				relativeEnd = Math.min(end, size);
			}
			var span = Math.max(relativeEnd - relativeStart, 0);

			var buffer = this[BUFFER];
			var slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
			var blob = new Blob([], { type: arguments[2] });
			blob[BUFFER] = slicedBuffer;
			return blob;
		}
	}, {
		key: 'size',
		get: function get() {
			return this[BUFFER].length;
		}
	}, {
		key: 'type',
		get: function get() {
			return this[TYPE];
		}
	}]);

	return Blob;
}();

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

function FetchError(message, type, systemError) {
	Error.call(this, message);

	this.message = message;
	this.type = type;

	if (systemError) {
		this.code = this.errno = systemError.code;
	}

	Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

var Stream = require('stream');

var _require = require('stream');

var PassThrough = _require.PassThrough;

var convert = void 0;
try {
	convert = require('encoding').convert;
} catch (e) {}

var INTERNALS = Symbol('Body internals');

function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	var size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	var timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		body = null;
	} else if (typeof body === 'string') {} else if (isURLSearchParams(body)) {} else if (body instanceof Blob) {} else if (Buffer.isBuffer(body)) {} else if (body instanceof Stream) {} else {
		body = String(body);
	}
	this[INTERNALS] = {
		body: body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			_this[INTERNALS].error = new FetchError('Invalid response body while trying to fetch ' + _this.url + ': ' + err.message, 'system', err);
		});
	}
}

Body.prototype = Object.defineProperties({
	arrayBuffer: function arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},
	blob: function blob() {
		var ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(new Blob([], {
				type: ct.toLowerCase()
			}), _defineProperty({}, BUFFER, buf));
		});
	},
	json: function json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError('invalid json response body at ' + _this2.url + ' reason: ' + err.message, 'invalid-json'));
			}
		});
	},
	text: function text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},
	buffer: function buffer() {
		return consumeBody.call(this);
	},
	textConverted: function textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
}, {
	body: {
		get: function get() {
			return this[INTERNALS].body;
		},
		configurable: true,
		enumerable: true
	},
	bodyUsed: {
		get: function get() {
			return this[INTERNALS].disturbed;
		},
		configurable: true,
		enumerable: true
	}
});

Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = Object.getOwnPropertyNames(Body.prototype)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var name = _step.value;

			if (!(name in proto)) {
				var desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
				Object.defineProperty(proto, name, desc);
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator['return']) {
				_iterator['return']();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}
};

function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError('body used already for: ' + this.url));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	if (this.body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	if (typeof this.body === 'string') {
		return Body.Promise.resolve(Buffer.from(this.body));
	}

	if (this.body instanceof Blob) {
		return Body.Promise.resolve(this.body[BUFFER]);
	}

	if (Buffer.isBuffer(this.body)) {
		return Body.Promise.resolve(this.body);
	}

	if (!(this.body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	var accum = [];
	var accumBytes = 0;
	var abort = false;

	return new Body.Promise(function (resolve, reject) {
		var resTimeout = void 0;

		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError('Response timeout while trying to fetch ' + _this4.url + ' (over ' + _this4.timeout + 'ms)', 'body-timeout'));
			}, _this4.timeout);
		}

		_this4.body.on('error', function (err) {
			reject(new FetchError('Invalid response body while trying to fetch ' + _this4.url + ': ' + err.message, 'system', err));
		});

		_this4.body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError('content size at ' + _this4.url + ' over limit: ' + _this4.size, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		_this4.body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);
			resolve(Buffer.concat(accum));
		});
	});
}

function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	var ct = headers.get('content-type');
	var charset = 'utf-8';
	var res = void 0,
	    str = void 0;

	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	str = buffer.slice(0, 1024).toString();

	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	if (res) {
		charset = res.pop();

		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	return convert(buffer, 'UTF-8', charset).toString();
}

function isURLSearchParams(obj) {
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj['delete'] !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

function _clone(instance) {
	var p1 = void 0,
	    p2 = void 0;
	var body = instance.body;

	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);

		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

function extractContentType(instance) {
	var body = instance.body;

	if (body === null) {
		return null;
	} else if (typeof body === 'string') {
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (body instanceof Blob) {
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		return null;
	} else if (typeof body.getBoundary === 'function') {
		return 'multipart/form-data;boundary=' + body.getBoundary();
	} else {
		return null;
	}
}

function getTotalBytes(instance) {
	var body = instance.body;

	if (body === null) {
		return 0;
	} else if (typeof body === 'string') {
		return Buffer.byteLength(body);
	} else if (isURLSearchParams(body)) {
		return Buffer.byteLength(String(body));
	} else if (body instanceof Blob) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || body.hasKnownLength && body.hasKnownLength()) {
			return body.getLengthSync();
		}
		return null;
	} else {
		return null;
	}
}

function writeToStream(dest, instance) {
	var body = instance.body;

	if (body === null) {
		dest.end();
	} else if (typeof body === 'string') {
		dest.write(body);
		dest.end();
	} else if (isURLSearchParams(body)) {
		dest.write(Buffer.from(String(body)));
		dest.end();
	} else if (body instanceof Blob) {
		dest.write(body[BUFFER]);
		dest.end();
	} else if (Buffer.isBuffer(body)) {
		dest.write(body);
		dest.end();
	} else {
		body.pipe(dest);
	}
}

Body.Promise = global.Promise;

function isValidTokenChar(ch) {
	if (ch >= 94 && ch <= 122) return true;
	if (ch >= 65 && ch <= 90) return true;
	if (ch === 45) return true;
	if (ch >= 48 && ch <= 57) return true;
	if (ch === 34 || ch === 40 || ch === 41 || ch === 44) return false;
	if (ch >= 33 && ch <= 46) return true;
	if (ch === 124 || ch === 126) return true;
	return false;
}

function checkIsHttpToken(val) {
	if (typeof val !== 'string' || val.length === 0) return false;
	if (!isValidTokenChar(val.charCodeAt(0))) return false;
	var len = val.length;
	if (len > 1) {
		if (!isValidTokenChar(val.charCodeAt(1))) return false;
		if (len > 2) {
			if (!isValidTokenChar(val.charCodeAt(2))) return false;
			if (len > 3) {
				if (!isValidTokenChar(val.charCodeAt(3))) return false;
				for (var i = 4; i < len; i++) {
					if (!isValidTokenChar(val.charCodeAt(i))) return false;
				}
			}
		}
	}
	return true;
}

function checkInvalidHeaderChar(val) {
	val += '';
	if (val.length < 1) return false;
	var c = val.charCodeAt(0);
	if (c <= 31 && c !== 9 || c > 255 || c === 127) return true;
	if (val.length < 2) return false;
	c = val.charCodeAt(1);
	if (c <= 31 && c !== 9 || c > 255 || c === 127) return true;
	if (val.length < 3) return false;
	c = val.charCodeAt(2);
	if (c <= 31 && c !== 9 || c > 255 || c === 127) return true;
	for (var i = 3; i < val.length; ++i) {
		c = val.charCodeAt(i);
		if (c <= 31 && c !== 9 || c > 255 || c === 127) return true;
	}
	return false;
}

function sanitizeName(name) {
	name += '';
	if (!checkIsHttpToken(name)) {
		throw new TypeError(name + ' is not a legal HTTP header name');
	}
	return name.toLowerCase();
}

function sanitizeValue(value) {
	value += '';
	if (checkInvalidHeaderChar(value)) {
		throw new TypeError(value + ' is not a legal HTTP header value');
	}
	return value;
}

var MAP = Symbol('map');

var Headers = function () {
	function Headers() {
		_classCallCheck(this, Headers);

		var init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			var rawHeaders = init.raw();
			var headerNames = Object.keys(rawHeaders);

			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = headerNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var headerName = _step2.value;
					var _iteratorNormalCompletion3 = true;
					var _didIteratorError3 = false;
					var _iteratorError3 = undefined;

					try {
						for (var _iterator3 = rawHeaders[headerName][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
							var value = _step3.value;

							this.append(headerName, value);
						}
					} catch (err) {
						_didIteratorError3 = true;
						_iteratorError3 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion3 && _iterator3['return']) {
								_iterator3['return']();
							}
						} finally {
							if (_didIteratorError3) {
								throw _iteratorError3;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2['return']) {
						_iterator2['return']();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			return;
		}

		if (init == null) {} else if (typeof init === 'object') {
			var method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				var pairs = [];
				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;

				try {
					for (var _iterator4 = init[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						var pair = _step4.value;

						if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
							throw new TypeError('Each header pair must be iterable');
						}
						pairs.push(Array.from(pair));
					}
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4['return']) {
							_iterator4['return']();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
				}

				var _iteratorNormalCompletion5 = true;
				var _didIteratorError5 = false;
				var _iteratorError5 = undefined;

				try {
					for (var _iterator5 = pairs[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
						var _pair = _step5.value;

						if (_pair.length !== 2) {
							throw new TypeError('Each header pair must be a name/value tuple');
						}
						this.append(_pair[0], _pair[1]);
					}
				} catch (err) {
					_didIteratorError5 = true;
					_iteratorError5 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion5 && _iterator5['return']) {
							_iterator5['return']();
						}
					} finally {
						if (_didIteratorError5) {
							throw _iteratorError5;
						}
					}
				}
			} else {
				var _iteratorNormalCompletion6 = true;
				var _didIteratorError6 = false;
				var _iteratorError6 = undefined;

				try {
					for (var _iterator6 = Object.keys(init)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
						var key = _step6.value;

						var _value = init[key];
						this.append(key, _value);
					}
				} catch (err) {
					_didIteratorError6 = true;
					_iteratorError6 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion6 && _iterator6['return']) {
							_iterator6['return']();
						}
					} finally {
						if (_didIteratorError6) {
							throw _iteratorError6;
						}
					}
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	_createClass(Headers, [{
		key: 'get',
		value: function get(name) {
			var list = this[MAP][sanitizeName(name)];
			if (!list) {
				return null;
			}

			return list.join(', ');
		}
	}, {
		key: 'forEach',
		value: function forEach(callback) {
			var thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

			var pairs = getHeaderPairs(this);
			var i = 0;
			while (i < pairs.length) {
				var _pairs$i = pairs[i];
				var name = _pairs$i[0],
				    value = _pairs$i[1];

				callback.call(thisArg, value, name, this);
				pairs = getHeaderPairs(this);
				i++;
			}
		}
	}, {
		key: 'set',
		value: function set(name, value) {
			this[MAP][sanitizeName(name)] = [sanitizeValue(value)];
		}
	}, {
		key: 'append',
		value: function append(name, value) {
			if (!this.has(name)) {
				this.set(name, value);
				return;
			}

			this[MAP][sanitizeName(name)].push(sanitizeValue(value));
		}
	}, {
		key: 'has',
		value: function has(name) {
			return !!this[MAP][sanitizeName(name)];
		}
	}, {
		key: 'delete',
		value: function _delete(name) {
			delete this[MAP][sanitizeName(name)];
		}
	}, {
		key: 'raw',
		value: function raw() {
			return this[MAP];
		}
	}, {
		key: 'keys',
		value: function keys() {
			return createHeadersIterator(this, 'key');
		}
	}, {
		key: 'values',
		value: function values() {
			return createHeadersIterator(this, 'value');
		}
	}, {
		key: Symbol.iterator,
		value: function value() {
			return createHeadersIterator(this, 'key+value');
		}
	}]);

	return Headers;
}();

Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	'delete': { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaderPairs(headers, kind) {
	var keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return [k];
	} : function (k) {
		return [k, headers.get(k)];
	});
}

var INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	var iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target: target,
		kind: kind,
		index: 0
	};
	return iterator;
}

var HeadersIteratorPrototype = Object.setPrototypeOf({
	next: function next() {
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		var target = _INTERNAL.target,
		    kind = _INTERNAL.kind,
		    index = _INTERNAL.index;

		var values = getHeaderPairs(target, kind);
		var len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		var pair = values[index];
		this[INTERNAL].index = index + 1;

		var result = void 0;
		if (kind === 'key') {
			result = pair[0];
		} else if (kind === 'value') {
			result = pair[1];
		} else {
			result = pair;
		}

		return {
			value: result,
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

var _require$1 = require('http');

var STATUS_CODES = _require$1.STATUS_CODES;

var INTERNALS$1 = Symbol('Response internals');

var Response = function () {
	function Response() {
		_classCallCheck(this, Response);

		var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		var status = opts.status || 200;

		this[INTERNALS$1] = {
			url: opts.url,
			status: status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers: new Headers(opts.headers)
		};
	}

	_createClass(Response, [{
		key: 'clone',
		value: function clone() {

			return new Response(_clone(this), {
				url: this.url,
				status: this.status,
				statusText: this.statusText,
				headers: this.headers,
				ok: this.ok
			});
		}
	}, {
		key: 'url',
		get: function get() {
			return this[INTERNALS$1].url;
		}
	}, {
		key: 'status',
		get: function get() {
			return this[INTERNALS$1].status;
		}
	}, {
		key: 'ok',
		get: function get() {
			return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
		}
	}, {
		key: 'statusText',
		get: function get() {
			return this[INTERNALS$1].statusText;
		}
	}, {
		key: 'headers',
		get: function get() {
			return this[INTERNALS$1].headers;
		}
	}]);

	return Response;
}();

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

var _require$2 = require('url');

var format_url = _require$2.format;
var parse_url = _require$2.parse;

var INTERNALS$2 = Symbol('Request internals');

function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

var Request = function () {
	function Request(input) {
		_classCallCheck(this, Request);

		var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		var parsedURL = void 0;

		if (!isRequest(input)) {
			if (input && input.href) {
				parsedURL = parse_url(input.href);
			} else {
				parsedURL = parse_url('' + input);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		var method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		var inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? _clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		var headers = new Headers(init.headers || input.headers || {});

		if (init.body != null) {
			var contentType = extractContentType(this);
			if (contentType !== null && !headers.has('Content-Type')) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$2] = {
			method: method,
			redirect: init.redirect || input.redirect || 'follow',
			headers: headers,
			parsedURL: parsedURL
		};

		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	_createClass(Request, [{
		key: 'clone',
		value: function clone() {
			return new Request(this);
		}
	}, {
		key: 'method',
		get: function get() {
			return this[INTERNALS$2].method;
		}
	}, {
		key: 'url',
		get: function get() {
			return format_url(this[INTERNALS$2].parsedURL);
		}
	}, {
		key: 'headers',
		get: function get() {
			return this[INTERNALS$2].headers;
		}
	}, {
		key: 'redirect',
		get: function get() {
			return this[INTERNALS$2].redirect;
		}
	}]);

	return Request;
}();

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true }
});

function getNodeRequestOptions(request) {
	var parsedURL = request[INTERNALS$2].parsedURL;
	var headers = new Headers(request[INTERNALS$2].headers);

	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	var contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		var totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	if (request.compress) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}
	if (!headers.has('Connection') && !request.agent) {
		headers.set('Connection', 'close');
	}

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: headers.raw(),
		agent: request.agent
	});
}

var http = require('http');
var https$1 = require('https');

var _require$3 = require('stream');

var PassThrough$1 = _require$3.PassThrough;

var _require2 = require('url');

var resolve_url = _require2.resolve;

var zlib = require('zlib');

function fetch(url, opts) {
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	return new fetch.Promise(function (resolve, reject) {
		var request = new Request(url, opts);
		var options = getNodeRequestOptions(request);

		var send = (options.protocol === 'https:' ? https$1 : http).request;

		if (options.headers.host) {
			options.headers.host = options.headers.host[0];
		}

		var req = send(options);
		var reqTimeout = void 0;

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					req.abort();
					reject(new FetchError('network timeout at: ' + request.url, 'request-timeout'));
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			clearTimeout(reqTimeout);
			reject(new FetchError('request to ' + request.url + ' failed, reason: ' + err.message, 'system', err));
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			if (fetch.isRedirect(res.statusCode) && request.redirect !== 'manual') {
				if (request.redirect === 'error') {
					reject(new FetchError('redirect mode is set to error: ' + request.url, 'no-redirect'));
					return;
				}

				if (request.counter >= request.follow) {
					reject(new FetchError('maximum redirect reached at: ' + request.url, 'max-redirect'));
					return;
				}

				if (!res.headers.location) {
					reject(new FetchError('redirect location header missing at: ' + request.url, 'invalid-redirect'));
					return;
				}

				var requestOpts = {
					headers: new Headers(request.headers),
					follow: request.follow,
					counter: request.counter + 1,
					agent: request.agent,
					compress: request.compress,
					method: request.method
				};

				if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
					requestOpts.method = 'GET';
					requestOpts.headers['delete']('content-length');
				}

				resolve(fetch(new Request(resolve_url(request.url, res.headers.location), requestOpts)));
				return;
			}

			var headers = new Headers();
			var _iteratorNormalCompletion7 = true;
			var _didIteratorError7 = false;
			var _iteratorError7 = undefined;

			try {
				for (var _iterator7 = Object.keys(res.headers)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
					var name = _step7.value;

					if (Array.isArray(res.headers[name])) {
						var _iteratorNormalCompletion8 = true;
						var _didIteratorError8 = false;
						var _iteratorError8 = undefined;

						try {
							for (var _iterator8 = res.headers[name][Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
								var val = _step8.value;

								headers.append(name, val);
							}
						} catch (err) {
							_didIteratorError8 = true;
							_iteratorError8 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion8 && _iterator8['return']) {
									_iterator8['return']();
								}
							} finally {
								if (_didIteratorError8) {
									throw _iteratorError8;
								}
							}
						}
					} else {
						headers.append(name, res.headers[name]);
					}
				}
			} catch (err) {
				_didIteratorError7 = true;
				_iteratorError7 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion7 && _iterator7['return']) {
						_iterator7['return']();
					}
				} finally {
					if (_didIteratorError7) {
						throw _iteratorError7;
					}
				}
			}

			if (request.redirect === 'manual' && headers.has('location')) {
				headers.set('location', resolve_url(request.url, headers.get('location')));
			}

			var body = res.pipe(new PassThrough$1());
			var response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout
			};

			var codings = headers.get('Content-Encoding');

			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				resolve(new Response(body, response_options));
				return;
			}

			var zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				resolve(new Response(body, response_options));
				return;
			}

			if (codings == 'deflate' || codings == 'x-deflate') {
				var raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					resolve(new Response(body, response_options));
				});
				return;
			}

			resolve(new Response(body, response_options));
		});

		writeToStream(req, request);
	});
}

fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

fetch['default'] = fetch;

fetch.Promise = global.Promise;

https.globalAgent.options.rejectUnauthorized = false;

var fetchModuleFromServer = function fetchModuleFromServer(key) {
	return fetch(key).then(function (response) {
		return response.text();
	});
};

var fetchModuleFromFileSystem = function fetchModuleFromFileSystem(key) {
	return new Promise(function (resolve, reject) {
		fs.readFile(key, function (error, buffer) {
			if (error) {
				reject(error);
			} else {
				resolve(String(buffer));
			}
		});
	});
};

var isNodeBuiltinModule = function isNodeBuiltinModule(moduleName) {
	if ("builtinModules" in Module) {
		return Module.builtinModules.includes(moduleName);
	}

	return repl._builtinLibs.includes(moduleName);
};

var fetchModuleSource = function fetchModuleSource(key) {
  if (key.indexOf("file:") === 0) {
    return fetchModuleFromFileSystem(fileUrlToPath(key));
  }
  if (key.indexOf("http:") === 0 || key.indexOf("https:") === 0) {
    return fetchModuleFromServer(key);
  }
  throw new Error("unsupported protocol for module " + key);
};

var createNodeLoader = function createNodeLoader() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      base = _ref.base;

  if (!isNode) {
    throw new Error("Node module loader can only be used in Node");
  }

  return createLoader({
    base: base,
    instantiate: function instantiate(key, processAnonRegister) {
      if (isNodeBuiltinModule(key)) {
        var nodeBuiltinModuleExports = require(key);
        var bindings = Object.assign({}, nodeBuiltinModuleExports, {
          "default": nodeBuiltinModuleExports
        });
        return Promise.resolve(new ModuleNamespace(bindings));
      }

      return fetchModuleSource(key).then(function (source) {
(eval)(source);
        processAnonRegister();
      });
    }
  });
};

exports.createNodeLoader = createNodeLoader;

//# sourceURL=/createLoader.js
//# sourceMappingURL=/index.js.map