"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createImportTracker = void 0;

const createImportTracker = () => {
  const importedMap = {};

  const markFileAsImported = file => {
    importedMap[file] = true;
  };

  const isFileImported = file => {
    return file in importedMap && importedMap[file] === true;
  };

  return {
    markFileAsImported,
    isFileImported
  };
};

exports.createImportTracker = createImportTracker;
//# sourceMappingURL=createImportTracker.js.map