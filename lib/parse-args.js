const Exclude = require('test-exclude')
const findUp = require('find-up')
const { readFileSync } = require('fs')
const yargs = require('yargs')
const parser = require('yargs-parser')

const configPath = findUp.sync(['.c8rc', '.c8rc.json'])
const config = configPath ? JSON.parse(readFileSync(configPath)) : {}

yargs()
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
  .option('coverage-directory', {
    default: './coverage',
    describe: 'directory to output coverage JSON and reports'
  })
  .option('temp-directory', {
    default: './coverage/tmp',
    describe: 'directory V8 coverage data is written to and read from'
  })
  .option('resolve', {
    default: '',
    describe: 'resolve paths to alternate base directory'
  })
  .option('omit-relative', {
    default: true,
    type: 'boolean',
    describe: 'omit any paths that are not absolute, e.g., internal/net.js'
  })
  .command('report', 'read V8 coverage data from temp and output report')
  .pkgConf('c8')
  .config(config)
  .demandCommand(1)
  .epilog('visit https://git.io/vHysA for list of available reporters')

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
  yargs,
  hideInstrumenterArgs,
  hideInstrumenteeArgs
}
