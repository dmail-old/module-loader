"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSystemLocation = void 0;

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const root = _path.default.resolve(__dirname, "../../../");

const getSystemLocation = () => {
  return `${root}/node_modules/systemjs/dist/system.js`;
};

exports.getSystemLocation = getSystemLocation;
//# sourceMappingURL=getSystemLocation.js.map