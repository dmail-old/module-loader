"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rejectionValueToMeta = void 0;

var _stringToStringWithLink = require("./stringToStringWithLink.js");

const parseErrorToMeta = (error, {
  fileToRemoteSourceFile
}) => {
  const parseError = JSON.parse(error.body);
  const file = parseError.fileName;
  const message = parseError.message;
  const data = message.replace(file, (0, _stringToStringWithLink.link)(`${fileToRemoteSourceFile(file)}`, file));
  return {
    file,
    data
  };
};

const errorToMeta = error => {
  return {
    data: (0, _stringToStringWithLink.stringToStringWithLink)(error.stack)
  };
};

const rejectionValueToMeta = (error, {
  fileToRemoteSourceFile,
  hrefToFile
}) => {
  if (error && error.status === 500 && error.reason === "parse error") {
    return parseErrorToMeta(error, {
      fileToRemoteSourceFile
    });
  }

  if (error && error.code === "MODULE_INSTANTIATE_ERROR") {
    const file = hrefToFile(error.url);
    const originalError = error.error;
    return {
      file,
      // eslint-disable-next-line no-use-before-define
      data: rejectionValueToMeta(originalError, {
        fileToRemoteSourceFile,
        hrefToFile
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

exports.rejectionValueToMeta = rejectionValueToMeta;
//# sourceMappingURL=rejectionValueToMeta.js.map