const Report = require('../report')

exports.command = 'check-coverage'

exports.describe = 'check whether coverage is within thresholds provided'

exports.builder = function (yargs) {
  yargs
    .option('branches', {
      default: 0,
      description: 'what % of branches must be covered?'
    })
    .option('functions', {
      default: 0,
      description: 'what % of functions must be covered?'
    })
    .option('lines', {
      default: 90,
      description: 'what % of lines must be covered?'
    })
    .option('statements', {
      default: 0,
      description: 'what % of statements must be covered?'
    })
    .option('per-file', {
      default: false,
      description: 'check thresholds per file'
    })
    .example('$0 check-coverage --lines 95', "check whether the JSON in nyc's output folder meets the thresholds provided")
}

exports.handler = function (argv) {
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
  const thresholds = {
    lines: argv.lines,
    functions: argv.functions,
    branches: argv.branches,
    statements: argv.statements
  }
  const map = report.getCoverageMapFromAllCoverageFiles()
  checkCoverages(map, thresholds, argv.perFile)
}

function checkCoverages (map, thresholds, perFile) {
  if (perFile) {
    map.files().forEach(file => {
      // ERROR: Coverage for lines (90.12%) does not meet threshold (120%) for index.js
      checkCoverage(map.fileCoverageFor(file).toSummary(), thresholds, file)
    })
  } else {
    // ERROR: Coverage for lines (90.12%) does not meet global threshold (120%)
    checkCoverage(map.getCoverageSummary(), thresholds)
  }
}

function checkCoverage (summary, thresholds, file) {
  Object.keys(thresholds).forEach(key => {
    const coverage = summary[key].pct
    if (coverage < thresholds[key]) {
      process.exitCode = 1
      if (file) {
        console.error('ERROR: Coverage for ' + key + ' (' + coverage + '%) does not meet threshold (' + thresholds[key] + '%) for ' + file)
      } else {
        console.error('ERROR: Coverage for ' + key + ' (' + coverage + '%) does not meet global threshold (' + thresholds[key] + '%)')
      }
    }
  })
}
