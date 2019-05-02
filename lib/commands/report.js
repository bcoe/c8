const { checkCoverages } = require('./check-coverage')
const Report = require('../report')

exports.command = 'report'

exports.describe = 'read V8 coverage data from temp and output report'

exports.handler = async function (argv) {
  await exports.outputReport(argv)
}

exports.outputReport = async function (argv) {
  const report = Report({
    include: argv.include,
    exclude: argv.exclude,
    reporter: Array.isArray(argv.reporter) ? argv.reporter : [argv.reporter],
    reportsDirectory: argv['reports-dir'],
    tempDirectory: argv.tempDirectory,
    watermarks: argv.watermarks,
    resolve: argv.resolve,
    omitRelative: argv.omitRelative,
    wrapperLength: argv.wrapperLength
  })
  await report.run()
  if (argv.checkCoverage) checkCoverages(argv, report)
}
