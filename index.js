const assert = require('assert');

class ModuleCaseError extends Error {
  constructor(module, duplicates) {
    super(`${module} also required as ${duplicates}`)
    this.module = module;
    this.duplicates = duplicates;
  }
}

class ModulePathError extends Error {
  constructor(module, duplicates) {
    super(`${module} also installed at ${duplicates}`)
    this.module = module;
    this.duplicates = duplicates;
  }
}

let onError;
const seenPaths = {};
const seenNames = {};

function checkModule(module) {
  const path = module.id;
  const pathLower = path.toLowerCase();
  if (pathLower in seenPaths) {
    onError(new ModuleCaseError(path, seenPaths[pathLower]));
    seenPaths[pathLower].push(path);
  } else {
    seenPaths[pathLower] = [path];
  }

  var dir = /(.*?node_modules\/([^\/]*))/.test(path) && RegExp.$1;
  if (dir) {
    const dirLower = dir.toLowerCase();
    const name = RegExp.$2;
    const nameLower = name.toLowerCase();
    if (nameLower in seenNames && seenNames[nameLower].indexOf(dirLower) < 0) {
      onError(new ModulePathError(dir, seenNames[nameLower]));
      seenNames[nameLower].push(dirLower);
    } else {
      seenNames[nameLower] = [dirLower];
    }
  }
}

exports = module.exports = function(errorHandler) {
  assert(errorHandler, 'checkForDuplicates error handler must be defined');
  assert(!onError, 'checkForDuplicates can only be initialized once');
  onError = errorHandler;

  // Check each module that's already been loaded
  const Module = module.constructor;
  for (const k in Module._cache) checkModule(Module._cache[k]);

  // Hook into module loading system to check future modules
  Module._cache = new Proxy(Module._cache, {
    set: function(target, k, v) {
      checkModule(v);
      target[k] = v;
      return true;
    }
  });
}

exports.ModuleCaseError = ModuleCaseError;
exports.ModulePathError = ModulePathError;
