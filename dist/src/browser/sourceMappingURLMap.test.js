"use strict";

var _sourceMappingURLMap = require("./sourceMappingURLMap.js");

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

{
  const source = `${"//#"} sourceMappingURL=a.js`;
  const actual = (0, _sourceMappingURLMap.sourceMappingURLMap)(source, value => `${value}.map`);
  const expected = `${"//#"} sourceMappingURL=a.js.map`;

  _assert.default.equal(actual, expected);
}
{
  const source = `before
${"//#"} sourceMappingURL=a.js
after`;
  const actual = (0, _sourceMappingURLMap.sourceMappingURLMap)(source, value => `${value}.map`);
  const expected = `before
${"//#"} sourceMappingURL=a.js.map
after`;

  _assert.default.equal(actual, expected);
}
console.log("passed");
//# sourceMappingURL=sourceMappingURLMap.test.js.map