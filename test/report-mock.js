const Report = require('../lib/report.js')

const ReportClass = Report({}, true)
class MockReport extends ReportClass {
  constructor (opts, spy, testCaseKey) {
    super(opts)
    this.spy = spy

    this.setSpyOn = false
    this.initSpies(testCaseKey)
  }

  getSpy () {
    return this.spy()
  }

  initSpies (testCaseKey) {
    if (testCaseKey === '_normalizeProcessCov: throw error') {
      this._normalizeProcessCovSpy()
    } else if (testCaseKey === '_loadReports: throw error') {
      this._loadReportsSpy()
    }
  }

  _normalizeProcessCovSpy () {
    this.spy.on(this, '_normalizeProcessCov', (v8ProcessCov, fileIndex) => {
      if (this.setSpyOn === false) {
        this.spy.on(Set.prototype, 'add', (value) => {
          throw new Error('This is just a test error to improve code coverage')
        })
        this.setSpyOn = true
      }
      return super._normalizeProcessCov(v8ProcessCov, fileIndex)
    })
  }

  _loadReportsSpy () {
    this.spy.on(this, '_loadReports', () => {
      if (this.setSpyOn === false) {
        this.spy.on(JSON, 'parse', (value) => {
          throw new Error('This is just a test error to improve code coverage')
        })
        this.setSpyOn = true
      }
      return super._loadReports()
    })
  }
}

module.exports = {
  MockReport: function (opts, spy, testCaseKey) {
    return new MockReport(opts, spy, testCaseKey)
  },
  MockReportClass: MockReport
}
