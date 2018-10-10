import path from "path"

const root = path.resolve(__dirname, "../../../")

export const getSystemLocation = () => {
  return `${root}/node_modules/systemjs/dist/system.js`
}
