const path = require("path")
const { fileWriteFromString } = require("@dmail/project-structure-compile-babel")

exports.fileSystemWriteCompileResult = async ({ code, map }, outputFile) => {
  if (map) {
    const sourceMapFile = `${path.basename(outputFile)}.map`
    const sourceMapLocationForSource = `${sourceMapFile}`
    const outputFolder = path.dirname(outputFile)
    const sourceMapAbsoluteFile = `${outputFolder}/${sourceMapFile}`

    return Promise.all([
      fileWriteFromString(
        outputFile,
        `${code}
//# sourceMappingURL=${sourceMapLocationForSource}`,
      ),
      fileWriteFromString(sourceMapAbsoluteFile, JSON.stringify(map, null, "  ")),
    ])
  }

  return fileWriteFromString(outputFile, code)
}
