const Exclude = require('test-exclude')
const libCoverage = require('istanbul-lib-coverage')
const libReport = require('istanbul-lib-report')
const reports = require('istanbul-reports')
const { readdirSync, readFileSync } = require('fs')
const { resolve, isAbsolute } = require('path')
const v8CoverageMerge = require('v8-coverage-merge')
const v8toIstanbul = require('v8-to-istanbul')

class Report {
  constructor ({
    exclude,
    include,
    reporter,
    tempDirectory,
    watermarks,
    resolve,
    omitRelative
  }) {
    this.reporter = reporter
    this.tempDirectory = tempDirectory
    this.watermarks = watermarks
    this.resolve = resolve
    this.exclude = Exclude({
      exclude: exclude,
      include: include
    })
    this.omitRelative = omitRelative
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
    this._loadReports().forEach((report, i) => {
      report.result.forEach((result) => {
        if (this.exclude.shouldInstrument(result.url) &&
            (!this.omitRelative || isAbsolute(result.url))) {
          if (mergedResults[result.url]) {
            const path = resolve(this.resolve, result.url)
            const script = v8toIstanbul(path)
            script.applyCoverage(result.functions)
            mergedResults[result.url].merge(script)
          } else {
            try {
              const path = resolve(this.resolve, result.url)
              mergedResults[result.url] = v8toIstanbul(path)
              mergedResults[result.url].applyCoverage(result.functions)
            } catch (err) {
              console.warn(`file: ${result.url} error: ${err.stack}`)
            }
          }
        }
      })
    })

    Object.keys(mergedResults).forEach((url) => {
      const script = mergedResults[url]
      map.merge(script.toIstanbul())
    })

    return map
  }
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
}

module.exports = function (opts) {
  const report = new Report(opts)
  report.run()
}
