const Exclude = require('test-exclude')
const findUp = require('find-up')
const { readFileSync } = require('fs')
const Yargs = require('yargs/yargs')
const parser = require('yargs-parser')

const configPath = findUp.sync(['.c8rc', '.c8rc.json'])
const config = configPath ? JSON.parse(readFileSync(configPath)) : {}

function buildYargs (withCommands = false) {
  const yargs = Yargs([])
    .usage('$0 [opts] [script] [opts]')
    .option('reporter', {
      alias: 'r',
      describe: 'coverage reporter(s) to use',
      default: 'text'
    })
    .option('exclude', {
      alias: 'x',
      default: Exclude.defaultExclude,
      describe: 'a list of specific files and directories that should be excluded from coverage (glob patterns are supported)'
    })
    .option('include', {
      alias: 'n',
      default: [],
      describe: 'a list of specific files that should be covered (glob patterns are supported)'
    })
    .option('check-coverage', {
      default: false,
      type: 'boolean',
      description: 'check whether coverage is within thresholds provided'
    })
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
    .option('temp-directory', {
      default: './coverage/tmp',
      describe: 'directory V8 coverage data is written to and read from'
    })
    .option('resolve', {
      default: '',
      describe: 'resolve paths to alternate base directory'
    })
    .option('wrapper-length', {
      describe: 'how many bytes is the wrapper prefix on executed JavaScript',
      type: 'number'
    })
    .option('omit-relative', {
      default: true,
      type: 'boolean',
      describe: 'omit any paths that are not absolute, e.g., internal/net.js'
    })
    .option('clean', {
      default: true,
      type: 'boolean',
      describe: 'should temp files be deleted before script execution'
    })
    .pkgConf('c8')
    .config(config)
    .demandCommand(1)
    .epilog('visit https://git.io/vHysA for list of available reporters')

  const checkCoverage = require('./commands/check-coverage')
  const report = require('./commands/report')
  if (withCommands) {
    yargs.command(checkCoverage)
    yargs.command(report)
  } else {
    yargs.command(checkCoverage.command, checkCoverage.describe)
    yargs.command(report.command, report.describe)
  }

  return yargs
}

function hideInstrumenterArgs (yargv) {
  var argv = process.argv.slice(1)
  argv = argv.slice(argv.indexOf(yargv._[0]))
  if (argv[0][0] === '-') {
    argv.unshift(process.execPath)
  }
  return argv
}

function hideInstrumenteeArgs () {
  let argv = process.argv.slice(2)
  const yargv = parser(argv)

  if (!yargv._.length) return argv

  // drop all the arguments after the bin being
  // instrumented by c8.
  argv = argv.slice(0, argv.indexOf(yargv._[0]))
  argv.push(yargv._[0])

  return argv
}

module.exports = {
  buildYargs,
  hideInstrumenterArgs,
  hideInstrumenteeArgs
}
