const Exclude = require('test-exclude')
const libCoverage = require('istanbul-lib-coverage')
const libReport = require('istanbul-lib-report')
const reports = require('istanbul-reports')
const { readdirSync, readFileSync } = require('fs')
const { resolve } = require('path')
const v8CoverageMerge = require('v8-coverage-merge')
const v8toIstanbul = require('v8-to-istanbul')

class Report {
  constructor ({
    exclude,
    include,
    reporter,
    coverageDirectory,
    watermarks,
    resolve
  }) {
    this.reporter = reporter
    this.coverageDirectory = coverageDirectory
    this.watermarks = watermarks
    this.resolve = resolve
    this.exclude = Exclude({
      exclude: exclude,
      include: include
    })
  }
  run () {
    const map = this._getCoverageMapFromAllCoverageFiles()
    var context = libReport.createContext({
      dir: './coverage',
      watermarks: this.watermarks
    })

    const tree = libReport.summarizers.pkg(map)

    this.reporter.forEach(function (_reporter) {
      tree.visit(reports.create(_reporter), context)
    })
  }
  _getCoverageMapFromAllCoverageFiles () {
    const map = libCoverage.createCoverageMap({})
    const mergedResults = {}
    this._loadReports().forEach((report) => {
      report.result.forEach((result) => {
        if (this.exclude.shouldInstrument(result.url)) {
          if (mergedResults[result.url]) {
            mergedResults[result.url] = v8CoverageMerge(
              mergedResults[result.url],
              result
            )
          } else {
            mergedResults[result.url] = result
          }
        }
      })
    })

    Object.keys(mergedResults).forEach((url) => {
      const result = mergedResults[url]
      // console.info(JSON.stringify(result, null, 2))
      try {
        const path = resolve(this.resolve, result.url)
        const script = v8toIstanbul(path)
        script.applyCoverage(result.functions)
        map.merge(script.toIstanbul())
      } catch (err) {
        // most likely this was an internal Node.js library.
        if (err.code !== 'ENOENT') throw err
      }
    })

    return map
  }
  _loadReports () {
    const tmpDirctory = resolve(this.coverageDirectory, './tmp')
    const files = readdirSync(tmpDirctory)

    return files.map((f) => {
      return JSON.parse(readFileSync(
        resolve(tmpDirctory, f),
        'utf8'
      ))
    })
  }
}

module.exports = function (opts) {
  const report = new Report(opts)
  report.run()
}
