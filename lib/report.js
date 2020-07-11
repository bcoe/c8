const Exclude = require('test-exclude')
const furi = require('furi')
const libCoverage = require('istanbul-lib-coverage')
const libReport = require('istanbul-lib-report')
const reports = require('istanbul-reports')
const { readdirSync, readFileSync, statSync } = require('fs')
const { isAbsolute, resolve, extname } = require('path')
const getSourceMapFromFile = require('./source-map-from-file')
// TODO: switch back to @c88/v8-coverage once patch is landed.
const v8toIstanbul = require('v8-to-istanbul')
const isCjsEsmBridgeCov = require('./is-cjs-esm-bridge')

class Report {
  constructor ({
    exclude,
    include,
    reporter,
    reportsDirectory,
    tempDirectory,
    watermarks,
    omitRelative,
    wrapperLength,
    resolve: resolvePaths,
    all,
    src,
    allowExternal = false
  }) {
    this.reporter = reporter
    this.reportsDirectory = reportsDirectory
    this.tempDirectory = tempDirectory
    this.watermarks = watermarks
    this.resolve = resolvePaths
    this.exclude = new Exclude({
      exclude: exclude,
      include: include,
      relativePath: !allowExternal
    })
    this.omitRelative = omitRelative
    this.sourceMapCache = {}
    this.wrapperLength = wrapperLength
    this.all = all
    this.src = this._getSrc(src)
  }

  _getSrc (src) {
    if (typeof src === 'string') {
      return [src]
    } else if (Array.isArray(src)) {
      return src
    } else {
      return [process.cwd()]
    }
  }

  async run () {
    var context = libReport.createContext({
      dir: this.reportsDirectory,
      watermarks: this.watermarks,
      coverageMap: await this.getCoverageMapFromAllCoverageFiles()
    })

    this.reporter.forEach(function (_reporter) {
      reports.create(_reporter, {
        skipEmpty: false,
        skipFull: false,
        maxCols: 100
      }).execute(context)
    })
  }

  async getCoverageMapFromAllCoverageFiles () {
    // the merge process can be very expensive, and it's often the case that
    // check-coverage is called immediately after a report. We memoize the
    // result from getCoverageMapFromAllCoverageFiles() to address this
    // use-case.
    if (this._allCoverageFiles) return this._allCoverageFiles

    const map = libCoverage.createCoverageMap()
    const v8ProcessCov = this._getMergedProcessCov()
    const resultCountPerPath = new Map()
    const possibleCjsEsmBridges = new Map()

    for (const v8ScriptCov of v8ProcessCov.result) {
      try {
        const sources = this._getSourceMap(v8ScriptCov)
        const path = resolve(this.resolve, v8ScriptCov.url)
        const converter = v8toIstanbul(path, this.wrapperLength, sources)
        await converter.load()

        if (resultCountPerPath.has(path)) {
          resultCountPerPath.set(path, resultCountPerPath.get(path) + 1)
        } else {
          resultCountPerPath.set(path, 0)
        }

        if (isCjsEsmBridgeCov(v8ScriptCov)) {
          possibleCjsEsmBridges.set(converter, {
            path,
            functions: v8ScriptCov.functions
          })
        } else {
          converter.applyCoverage(v8ScriptCov.functions)
          map.merge(converter.toIstanbul())
        }
      } catch (err) {
        console.warn(`file: ${v8ScriptCov.url} error: ${err.stack}`)
      }
    }

    for (const [converter, { path, functions }] of possibleCjsEsmBridges) {
      if (resultCountPerPath.get(path) <= 1) {
        converter.applyCoverage(functions)
        map.merge(converter.toIstanbul())
      }
    }
    this._allCoverageFiles = map
    return this._allCoverageFiles
  }

  /**
   * Returns source-map and fake source file, if cached during Node.js'
   * execution. This is used to support tools like ts-node, which transpile
   * using runtime hooks.
   *
   * Note: requires Node.js 13+
   *
   * @return {Object} sourceMap and fake source file (created from line #s).
   * @private
   */
  _getSourceMap (v8ScriptCov) {
    const sources = {}
    if (this.sourceMapCache[`file://${v8ScriptCov.url}`]) {
      const sourceMapAndLineLengths = this.sourceMapCache[`file://${v8ScriptCov.url}`]
      // See: https://github.com/nodejs/node/pull/34305
      if (!sourceMapAndLineLengths.data) return
      sources.sourceMap = {
        sourcemap: sourceMapAndLineLengths.data
      }
      if (sourceMapAndLineLengths.lineLengths) {
        let source = ''
        sourceMapAndLineLengths.lineLengths.forEach(length => {
          source += `${''.padEnd(length, '.')}\n`
        })
        sources.source = source
      }
    }
    return sources
  }

  /**
   * Returns the merged V8 process coverage.
   *
   * The result is computed from the individual process coverages generated
   * by Node. It represents the sum of their counts.
   *
   * @return {ProcessCov} Merged V8 process coverage.
   * @private
   */
  _getMergedProcessCov () {
    const { mergeProcessCovs } = require('@bcoe/v8-coverage')
    const v8ProcessCovs = []
    const fileIndex = new Set() // Set<string>
    for (const v8ProcessCov of this._loadReports()) {
      if (this._isCoverageObject(v8ProcessCov)) {
        if (v8ProcessCov['source-map-cache']) {
          Object.assign(this.sourceMapCache, v8ProcessCov['source-map-cache'])
        }
        v8ProcessCovs.push(this._normalizeProcessCov(v8ProcessCov, fileIndex))
      }
    }

    if (this.all) {
      const emptyReports = []
      v8ProcessCovs.unshift({
        result: emptyReports
      })
      const workingDirs = this.src
      for (const workingDir of workingDirs) {
        this.exclude.globSync(workingDir).forEach((f) => {
          const fullPath = resolve(workingDir, f)
          if (!fileIndex.has(fullPath)) {
            const ext = extname(fullPath)
            if (ext === '.js' || ext === '.ts' || ext === '.mjs') {
              const stat = statSync(fullPath)
              const sourceMap = getSourceMapFromFile(fullPath)
              if (sourceMap !== undefined) {
                this.sourceMapCache[`file://${fullPath}`] = { data: JSON.parse(readFileSync(sourceMap).toString()) }
              }
              emptyReports.push({
                scriptId: 0,
                url: resolve(fullPath),
                functions: [{
                  functionName: '(empty-report)',
                  ranges: [{
                    startOffset: 0,
                    endOffset: stat.size,
                    count: 0
                  }],
                  isBlockCoverage: true
                }]
              })
            }
          }
        })
      }
    }

    return mergeProcessCovs(v8ProcessCovs)
  }

  /**
   * Make sure v8ProcessCov actually contains coverage information.
   *
   * @return {boolean} does it look like v8ProcessCov?
   * @private
   */
  _isCoverageObject (maybeV8ProcessCov) {
    return maybeV8ProcessCov && Array.isArray(maybeV8ProcessCov.result)
  }

  /**
   * Returns the list of V8 process coverages generated by Node.
   *
   * @return {ProcessCov[]} Process coverages generated by Node.
   * @private
   */
  _loadReports () {
    const files = readdirSync(this.tempDirectory)

    return files.map((f) => {
      try {
        return JSON.parse(readFileSync(
          resolve(this.tempDirectory, f),
          'utf8'
        ))
      } catch (err) {
        console.warn(`${err.stack}`)
      }
    })
  }

  /**
   * Normalizes a process coverage.
   *
   * This function replaces file URLs (`url` property) by their corresponding
   * system-dependent path and applies the current inclusion rules to filter out
   * the excluded script coverages.
   *
   * The result is a copy of the input, with script coverages filtered based
   * on their `url` and the current inclusion rules.
   * There is no deep cloning.
   *
   * @param v8ProcessCov V8 process coverage to normalize.
   * @param fileIndex a Set<string> of paths discovered in coverage
   * @return {v8ProcessCov} Normalized V8 process coverage.
   * @private
   */
  _normalizeProcessCov (v8ProcessCov, fileIndex) {
    const result = []
    for (const v8ScriptCov of v8ProcessCov.result) {
      if (/^file:\/\//.test(v8ScriptCov.url)) {
        try {
          v8ScriptCov.url = furi.toSysPath(v8ScriptCov.url)
          fileIndex.add(v8ScriptCov.url)
        } catch (err) {
          console.warn(err)
          continue
        }
      }
      if (this.exclude.shouldInstrument(v8ScriptCov.url) &&
        (!this.omitRelative || isAbsolute(v8ScriptCov.url))) {
        result.push(v8ScriptCov)
      }
    }
    return { result }
  }
}

module.exports = function (opts) {
  return new Report(opts)
}
