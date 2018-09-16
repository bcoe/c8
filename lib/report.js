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
    this._loadReports().forEach((report) => {
      report.result.forEach((result) => {
        if (this.exclude.shouldInstrument(result.url) &&
            (!this.omitRelative || isAbsolute(result.url))) {
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
      try {
        const result = mergedResults[url]
        const path = resolve(this.resolve, result.url)
        const script = v8toIstanbul(path)
        script.applyCoverage(result.functions)
        map.merge(script.toIstanbul())
      } catch (err) {
        console.warn(`file: ${url} error: ${err.stack}`)
      }
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
