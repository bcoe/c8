const convertSourceMap = require('convert-source-map')
const libSourceMaps = require('istanbul-lib-source-maps')
const { dirname } = require('path')

function SourceMapUtil () {
  this.sourceMapCache = libSourceMaps.createSourceMapStore()
}

SourceMapUtil.prototype.extractAndCacheSourceMap = function (source, sourcePath) {
  var sourceMap = convertSourceMap.fromSource(source) || convertSourceMap.fromMapFileSource(source, dirname(sourcePath))
  if (sourceMap) {
    this.sourceMapCache.registerMap(sourcePath, sourceMap.sourcemap)
  }
}

SourceMapUtil.prototype.remap = function (obj) {
  const transformed = this.sourceMapCache.transformCoverage(obj)
  return transformed.map
}

module.exports = SourceMapUtil
