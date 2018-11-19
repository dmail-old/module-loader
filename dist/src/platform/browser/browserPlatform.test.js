"use strict";

var _browserPlatform = require("./browserPlatform.js");

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// won't work because rollup needs path to @dmail/project-structure-compile-babel/src/versionCompare.js
// but we will no support export token
{
  const actual = (0, _browserPlatform.browserToCompileId)({
    name: "chrome",
    version: "39"
  }, {
    foo: {
      compatMap: {
        chrome: "41"
      }
    }
  });
  const expected = "foo";

  _assert.default.deepEqual(actual, expected);
}
{
  const actual = (0, _browserPlatform.browserToCompileId)({
    name: "chrome",
    version: "41"
  }, {
    foo: {
      compatMap: {
        chrome: "41"
      }
    }
  });
  const expected = null;

  _assert.default.deepEqual(actual, expected);
}
{
  const actual = (0, _browserPlatform.browserToCompileId)({
    name: "chrome",
    version: "42"
  }, {
    foo: {
      compatMap: {
        chrome: "41"
      }
    }
  });
  const expected = null;

  _assert.default.deepEqual(actual, expected);
}
console.log("passed");
//# sourceMappingURL=browserPlatform.test.js.map