const { relative } = require('path')
const Report = require('../report')

exports.command = 'check-coverage'

exports.describe = 'check whether coverage is within thresholds provided'

exports.builder = function (yargs) {
  yargs
    .example('$0 check-coverage --lines 95', "check whether the JSON in c8's output folder meets the thresholds provided")
}

exports.handler = function (argv) {
  const report = Report({
    include: argv.include,
    exclude: argv.exclude,
    reporter: Array.isArray(argv.reporter) ? argv.reporter : [argv.reporter],
    reportsDirectory: argv['reports-dir'],
    tempDirectory: argv.tempDirectory,
    watermarks: argv.watermarks,
    resolve: argv.resolve,
    omitRelative: argv.omitRelative,
    wrapperLength: argv.wrapperLength,
    all: argv.all
  })
  exports.checkCoverages(argv, report)
}

exports.checkCoverages = async function (argv, report) {
  const thresholds = {
    lines: argv.lines,
    functions: argv.functions,
    branches: argv.branches,
    statements: argv.statements
  }
  const map = await report.getCoverageMapFromAllCoverageFiles()
  if (argv.perFile) {
    map.files().forEach(file => {
      checkCoverage(map.fileCoverageFor(file).toSummary(), thresholds, file)
    })
  } else {
    checkCoverage(map.getCoverageSummary(), thresholds)
  }
}

function checkCoverage (summary, thresholds, file) {
  Object.keys(thresholds).forEach(key => {
    const coverage = summary[key].pct
    if (coverage < thresholds[key]) {
      process.exitCode = 1
      if (file) {
        console.error(
          'ERROR: Coverage for ' + key + ' (' + coverage + '%) does not meet threshold (' + thresholds[key] + '%) for ' +
            relative('./', file).replace(/\\/g, '/') // standardize path for Windows.
        )
      } else {
        console.error('ERROR: Coverage for ' + key + ' (' + coverage + '%) does not meet global threshold (' + thresholds[key] + '%)')
      }
    }
  })
}
