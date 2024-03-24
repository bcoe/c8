const Exclude = require('test-exclude')
const path = require('path')
const { fileURLToPath } = require('url')

const { CoverageReport } = require('monocart-coverage-reports')

module.exports = async (argv) => {
  // console.log(argv);
  const exclude = new Exclude({
    exclude: argv.exclude,
    include: argv.include,
    extension: argv.extension,
    relativePath: !argv.allowExternal,
    excludeNodeModules: argv.excludeNodeModules
  })

  // adapt coverage options
  const coverageOptions = getCoverageOptions(argv, exclude)
  const coverageReport = new CoverageReport(coverageOptions)
  coverageReport.cleanCache()

  // read v8 coverage data from tempDirectory
  await coverageReport.addFromDir(argv.tempDirectory)

  // generate report
  await coverageReport.generate()
}

function getReports (argv) {
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
function getAllOptions (argv, exclude) {
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

function getEntryFilter (argv, exclude) {
  if (argv.entryFilter) {
    return argv.entryFilter
  }
  return (entry) => {
    return exclude.shouldInstrument(fileURLToPath(entry.url))
  }
}

function getSourceFilter (argv, exclude) {
  if (argv.sourceFilter) {
    return argv.sourceFilter
  }
  return (sourcePath) => {
    if (argv.excludeAfterRemap) {
      // console.log(sourcePath)
      return exclude.shouldInstrument(sourcePath)
    }
    return true
  }
}

function getCoverageOptions (argv, exclude) {
  const reports = getReports(argv)
  const allOptions = getAllOptions(argv, exclude)

  return {
    logging: argv.logging,
    name: argv.name,
    inline: argv.inline,
    lcov: argv.lcov,
    outputDir: argv.reportsDir,
    clean: argv.clean,

    reports,
    all: allOptions,

    // use default value for istanbul
    defaultSummarizer: 'pkg',

    entryFilter: getEntryFilter(argv, exclude),

    sourceFilter: getSourceFilter(argv, exclude),

    // sourcePath: (filePath) => {
    //   return path.resolve(filePath);
    // },

    onEnd: (coverageResults) => {
      // console.log(`Coverage report generated: ${coverageResults.reportPath}`);

      if (!argv.checkCoverage) {
        return
      }

      // check thresholds
      const thresholds = {}
      const metrics = ['bytes', 'statements', 'branches', 'functions', 'lines']
      metrics.forEach((k) => {
        if (argv[k]) {
          thresholds[k] = argv[k]
        }
      })

      const { summary, files } = coverageResults

      if (argv.perFile) {
        files.forEach((file) => {
          checkCoverage(file.summary, thresholds, file)
        })
      } else {
        checkCoverage(summary, thresholds)
      }
    }
  }
}

function checkCoverage (summary, thresholds, file) {
  if (file && file.empty) {
    process.exitCode = 1
    console.error(
      'ERROR: Empty coverage (untested file) does not meet threshold for ' +
        path.relative('./', file.sourcePath).replace(/\\/g, '/')
    )
    return
  }
  Object.keys(thresholds).forEach(key => {
    const coverage = summary[key].pct
    if (typeof coverage !== 'number') {
      return
    }
    if (coverage < thresholds[key]) {
      process.exitCode = 1
      if (file) {
        console.error(
          'ERROR: Coverage for ' + key + ' (' + coverage + '%) does not meet threshold (' + thresholds[key] + '%) for ' +
            path.relative('./', file.sourcePath).replace(/\\/g, '/') // standardize path for Windows.
        )
      } else {
        console.error('ERROR: Coverage for ' + key + ' (' + coverage + '%) does not meet global threshold (' + thresholds[key] + '%)')
      }
    }
  })
}
