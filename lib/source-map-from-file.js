const { isAbsolute, join, dirname } = require('path')
const { readFileSync } = require('fs')
/**
 * Extract the sourcemap url from a source file
 * reference: https://sourcemaps.info/spec.html
 * @param {String} file - compilation target file
 * @returns {String} full path to source map file
 * @private
 */
function getSourceMapFromFile (file) {
  const fileBody = readFileSync(file).toString()
  const sourceMapLineRE = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/mg
  const results = fileBody.match(sourceMapLineRE)
  if (results !== null) {
    const sourceMap = results[results.length - 1].split('=')[1]
    if (isAbsolute(sourceMap)) {
      return sourceMap.trim()
    } else {
      const base = dirname(file)
      return join(base, sourceMap).trim()
    }
  }
}

module.exports = getSourceMapFromFile
