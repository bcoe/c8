const { checkCoverages } = require('./check-coverage')
const Report = require('../report')

exports.command = 'report'

exports.describe = 'read V8 coverage data from temp and output report'

exports.handler = function (argv) {
  exports.outputReport(argv)
}

exports.outputReport = function (argv) {
  const report = Report({
    include: argv.include,
    exclude: argv.exclude,
    reporter: Array.isArray(argv.reporter) ? argv.reporter : [argv.reporter],
    tempDirectory: argv.tempDirectory,
    watermarks: argv.watermarks,
    resolve: argv.resolve,
    omitRelative: argv.omitRelative,
    wrapperLength: argv.wrapperLength
  })
  report.run()
  if (argv.checkCoverage) checkCoverages(argv, report)
}
