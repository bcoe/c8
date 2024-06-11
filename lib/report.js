const Exclude = require('test-exclude')
const libCoverage = require('istanbul-lib-coverage')
const libReport = require('istanbul-lib-report')
const reports = require('istanbul-reports')
let readFile
try {
  ;({ readFile } = require('fs/promises'))
} catch (err) {
  ;({ readFile } = require('fs').promises)
}
const { readdirSync, readFileSync, statSync } = require('fs')
const { isAbsolute, resolve, extname } = require('path')
const { pathToFileURL, fileURLToPath } = require('url')
const getSourceMapFromFile = require('./source-map-from-file')
// TODO: switch back to @c88/v8-coverage once patch is landed.
const v8toIstanbul = require('v8-to-istanbul')
const util = require('util')
const debuglog = util.debuglog('c8')

class Report {
  constructor ({
    exclude,
    extension,
    excludeAfterRemap,
    include,
    reporter,
    reporterOptions,
    reportsDirectory,
    tempDirectory,
    watermarks,
    omitRelative,
    wrapperLength,
    resolve: resolvePaths,
    all,
    src,
    allowExternal = false,
    skipFull,
    excludeNodeModules,
    mergeAsync,
    monocartArgv
  }) {
    this.reporter = reporter
    this.reporterOptions = reporterOptions || {}
    this.reportsDirectory = reportsDirectory
    this.tempDirectory = tempDirectory
    this.watermarks = watermarks
    this.resolve = resolvePaths
    this.exclude = new Exclude({
      exclude: exclude,
      include: include,
      extension: extension,
      relativePath: !allowExternal,
      excludeNodeModules: excludeNodeModules
    })
    this.excludeAfterRemap = excludeAfterRemap
    this.shouldInstrumentCache = new Map()
    this.omitRelative = omitRelative
    this.sourceMapCache = {}
    this.wrapperLength = wrapperLength
    this.all = all
    this.src = this._getSrc(src)
    this.skipFull = skipFull
    this.mergeAsync = mergeAsync
    this.monocartArgv = monocartArgv
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
    if (this.monocartArgv) {
      return this.runMonocart()
    }
    const context = libReport.createContext({
      dir: this.reportsDirectory,
      watermarks: this.watermarks,
      coverageMap: await this.getCoverageMapFromAllCoverageFiles()
    })

    for (const _reporter of this.reporter) {
      reports.create(_reporter, {
        skipEmpty: false,
        skipFull: this.skipFull,
        maxCols: process.stdout.columns || 100,
        ...this.reporterOptions[_reporter]
      }).execute(context)
    }
  }

  async importMonocart () {
    return import('monocart-coverage-reports')
  }

  async getMonocart () {
    let MCR
    try {
      MCR = await this.importMonocart()
    } catch (e) {
      console.error('--experimental-monocart requires the plugin monocart-coverage-reports. Run: "npm i monocart-coverage-reports@2 --save-dev"')
      process.exit(1)
    }
    return MCR
  }

  async runMonocart () {
    const MCR = await this.getMonocart()
    if (!MCR) {
      return
    }

    const argv = this.monocartArgv
    const exclude = this.exclude

    function getEntryFilter () {
      return argv.entryFilter || argv.filter || function (entry) {
        return exclude.shouldInstrument(fileURLToPath(entry.url))
      }
    }

    function getSourceFilter () {
      return argv.sourceFilter || argv.filter || function (sourcePath) {
        if (argv.excludeAfterRemap) {
          // console.log(sourcePath)
          return exclude.shouldInstrument(sourcePath)
        }
        return true
      }
    }

    function getReports () {
      const reports = Array.isArray(argv.reporter) ? argv.reporter : [argv.reporter]
      const reporterOptions = argv.reporterOptions || {}

      return reports.map((reportName) => {
        const reportOptions = {
          ...reporterOptions[reportName]
        }
        if (reportName === 'text') {
          reportOptions.skipEmpty = false
          reportOptions.skipFull = argv.skipFull
          reportOptions.maxCols = process.stdout.columns || 100
        }
        return [reportName, reportOptions]
      })
    }

    // --all: add empty coverage for all files
    function getAllOptions () {
      if (!argv.all) {
        return
      }

      const src = argv.src
      const workingDirs = Array.isArray(src) ? src : (typeof src === 'string' ? [src] : [process.cwd()])
      return {
        dir: workingDirs,
        filter: (filePath) => {
          return exclude.shouldInstrument(filePath)
        }
      }
    }

    function initPct (summary) {
      Object.keys(summary).forEach(k => {
        if (summary[k].pct === '') {
          summary[k].pct = 100
        }
      })
      return summary
    }

    // adapt coverage options
    const coverageOptions = {
      logging: argv.logging,
      name: argv.name,

      reports: getReports(),

      outputDir: argv.reportsDir,
      baseDir: argv.baseDir,

      entryFilter: getEntryFilter(),
      sourceFilter: getSourceFilter(),

      inline: argv.inline,
      lcov: argv.lcov,

      all: getAllOptions(),

      clean: argv.clean,

      // use default value for istanbul
      defaultSummarizer: 'pkg',

      onEnd: (coverageResults) => {
        // for check coverage
        this._allCoverageFiles = {
          files: () => {
            return coverageResults.files.map(it => it.sourcePath)
          },
          fileCoverageFor: (file) => {
            const fileCoverage = coverageResults.files.find(it => it.sourcePath === file)
            return {
              toSummary: () => {
                return initPct(fileCoverage.summary)
              }
            }
          },
          getCoverageSummary: () => {
            return initPct(coverageResults.summary)
          }
        }
      }
    }
    const coverageReport = new MCR.CoverageReport(coverageOptions)
    coverageReport.cleanCache()

    // read v8 coverage data from tempDirectory
    await coverageReport.addFromDir(argv.tempDirectory)

    // generate report
    await coverageReport.generate()
  }

  async getCoverageMapFromAllCoverageFiles () {
    // the merge process can be very expensive, and it's often the case that
    // check-coverage is called immediately after a report. We memoize the
    // result from getCoverageMapFromAllCoverageFiles() to address this
    // use-case.
    if (this._allCoverageFiles) return this._allCoverageFiles

    const map = libCoverage.createCoverageMap()
    let v8ProcessCov

    if (this.mergeAsync) {
      v8ProcessCov = await this._getMergedProcessCovAsync()
    } else {
      v8ProcessCov = this._getMergedProcessCov()
    }
    const resultCountPerPath = new Map()

    for (const v8ScriptCov of v8ProcessCov.result) {
      try {
        const sources = this._getSourceMap(v8ScriptCov)
        const path = resolve(this.resolve, v8ScriptCov.url)
        const converter = v8toIstanbul(path, this.wrapperLength, sources, (path) => {
          if (this.excludeAfterRemap) {
            return !this._shouldInstrument(path)
          }
        })
        await converter.load()

        if (resultCountPerPath.has(path)) {
          resultCountPerPath.set(path, resultCountPerPath.get(path) + 1)
        } else {
          resultCountPerPath.set(path, 0)
        }

        converter.applyCoverage(v8ScriptCov.functions)
        map.merge(converter.toIstanbul())
      } catch (err) {
        debuglog(`file: ${v8ScriptCov.url} error: ${err.stack}`)
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
    const sourceMapAndLineLengths = this.sourceMapCache[pathToFileURL(v8ScriptCov.url).href]
    if (sourceMapAndLineLengths) {
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
          Object.assign(this.sourceMapCache, this._normalizeSourceMapCache(v8ProcessCov['source-map-cache']))
        }
        v8ProcessCovs.push(this._normalizeProcessCov(v8ProcessCov, fileIndex))
      }
    }

    if (this.all) {
      const emptyReports = this._includeUncoveredFiles(fileIndex)
      v8ProcessCovs.unshift({
        result: emptyReports
      })
    }

    return mergeProcessCovs(v8ProcessCovs)
  }

  /**
   * Returns the merged V8 process coverage.
   *
   * It asynchronously and incrementally reads and merges individual process coverages
   * generated by Node. This can be used via the `--merge-async` CLI arg.  It's intended
   * to be used across a large multi-process test run.
   *
   * @return {ProcessCov} Merged V8 process coverage.
   * @private
   */
  async _getMergedProcessCovAsync () {
    const { mergeProcessCovs } = require('@bcoe/v8-coverage')
    const fileIndex = new Set() // Set<string>
    let mergedCov = null
    for (const file of readdirSync(this.tempDirectory)) {
      try {
        const rawFile = await readFile(
          resolve(this.tempDirectory, file),
          'utf8'
        )
        let report = JSON.parse(rawFile)

        if (this._isCoverageObject(report)) {
          if (report['source-map-cache']) {
            Object.assign(this.sourceMapCache, this._normalizeSourceMapCache(report['source-map-cache']))
          }
          report = this._normalizeProcessCov(report, fileIndex)
          if (mergedCov) {
            mergedCov = mergeProcessCovs([mergedCov, report])
          } else {
            mergedCov = mergeProcessCovs([report])
          }
        }
      } catch (err) {
        debuglog(`${err.stack}`)
      }
    }

    if (this.all) {
      const emptyReports = this._includeUncoveredFiles(fileIndex)
      const emptyReport = {
        result: emptyReports
      }

      mergedCov = mergeProcessCovs([emptyReport, mergedCov])
    }

    return mergedCov
  }

  /**
   * Adds empty coverage reports to account for uncovered/untested code.
   * This is only done when the `--all` flag is present.
   *
   * @param {Set} fileIndex list of files that have coverage
   * @returns {Array} list of empty coverage reports
   */
  _includeUncoveredFiles (fileIndex) {
    const emptyReports = []
    const workingDirs = this.src
    const { extension } = this.exclude
    for (const workingDir of workingDirs) {
      this.exclude.globSync(workingDir).forEach((f) => {
        const fullPath = resolve(workingDir, f)
        if (!fileIndex.has(fullPath)) {
          const ext = extname(fullPath)
          if (extension.includes(ext)) {
            const stat = statSync(fullPath)
            const sourceMap = getSourceMapFromFile(fullPath)
            if (sourceMap) {
              this.sourceMapCache[pathToFileURL(fullPath)] = { data: sourceMap }
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

    return emptyReports
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
    const reports = []
    for (const file of readdirSync(this.tempDirectory)) {
      try {
        reports.push(JSON.parse(readFileSync(
          resolve(this.tempDirectory, file),
          'utf8'
        )))
      } catch (err) {
        debuglog(`${err.stack}`)
      }
    }
    return reports
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
      // https://github.com/nodejs/node/pull/35498 updates Node.js'
      // builtin module filenames:
      if (/^node:/.test(v8ScriptCov.url)) {
        v8ScriptCov.url = `${v8ScriptCov.url.replace(/^node:/, '')}.js`
      }
      if (/^file:\/\//.test(v8ScriptCov.url)) {
        try {
          v8ScriptCov.url = fileURLToPath(v8ScriptCov.url)
          fileIndex.add(v8ScriptCov.url)
        } catch (err) {
          debuglog(`${err.stack}`)
          continue
        }
      }
      if ((!this.omitRelative || isAbsolute(v8ScriptCov.url))) {
        if (this.excludeAfterRemap || this._shouldInstrument(v8ScriptCov.url)) {
          result.push(v8ScriptCov)
        }
      }
    }
    return { result }
  }

  /**
   * Normalizes a V8 source map cache.
   *
   * This function normalizes file URLs to a system-independent format.
   *
   * @param v8SourceMapCache V8 source map cache to normalize.
   * @return {v8SourceMapCache} Normalized V8 source map cache.
   * @private
   */
  _normalizeSourceMapCache (v8SourceMapCache) {
    const cache = {}
    for (const fileURL of Object.keys(v8SourceMapCache)) {
      cache[pathToFileURL(fileURLToPath(fileURL)).href] = v8SourceMapCache[fileURL]
    }
    return cache
  }

  /**
   * this.exclude.shouldInstrument with cache
   *
   * @private
   * @return {boolean}
   */
  _shouldInstrument (filename) {
    const cacheResult = this.shouldInstrumentCache.get(filename)
    if (cacheResult !== undefined) {
      return cacheResult
    }

    const result = this.exclude.shouldInstrument(filename)
    this.shouldInstrumentCache.set(filename, result)
    return result
  }
}

module.exports = function (opts) {
  return new Report(opts)
}
