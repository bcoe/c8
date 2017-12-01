const libCoverage = require('istanbul-lib-coverage')
const libReport = require('istanbul-lib-report')
const reports = require('istanbul-reports')
const {readdirSync, readFileSync} = require('fs')
const {resolve} = require('path')

class Report {
  constructor ({reporter, coverageDirectory, watermarks}) {
    this.reporter = reporter
    this.coverageDirectory = coverageDirectory
    this.watermarks = watermarks
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

    this._loadReports().forEach(function (report) {
      map.merge(report)
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
