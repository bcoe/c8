const defaultExclude = require('@istanbuljs/schema/default-exclude')
const defaultExtension = require('@istanbuljs/schema/default-extension')
const findUp = require('find-up')
const { readFileSync } = require('fs')
const Yargs = require('yargs/yargs')
const { applyExtends } = require('yargs/helpers')
const parser = require('yargs-parser')
const { resolve } = require('path')

function buildYargs (withCommands = false) {
  const yargs = Yargs([])
    .usage('$0 [opts] [script] [opts]')
    .options('config', {
      alias: 'c',
      config: true,
      describe: 'path to JSON configuration file',
      configParser: (path) => {
        const config = JSON.parse(readFileSync(path))
        return applyExtends(config, process.cwd(), true)
      },
      default: () => findUp.sync(['.c8rc', '.c8rc.json', '.nycrc', '.nycrc.json'])
    })
    .option('reporter', {
      alias: 'r',
      group: 'Reporting options',
      describe: 'coverage reporter(s) to use',
      default: 'text'
    })
    .option('reports-dir', {
      alias: ['o', 'report-dir'],
      group: 'Reporting options',
      describe: 'directory where coverage reports will be output to',
      default: './coverage'
    })
    .options('all', {
      default: false,
      type: 'boolean',
      group: 'Reporting options',
      describe: 'supplying --all will cause c8 to consider all src files in the current working directory ' +
        'when the determining coverage. Respects include/exclude.'
    })
    .options('src', {
      default: undefined,
      type: 'string',
      group: 'Reporting options',
      describe: 'supplying --src will override cwd as the default location where --all looks for src files. --src can be ' +
        'supplied multiple times and each directory will be included. This allows for workspaces spanning multiple projects'
    })
    .option('exclude-node-modules', {
      default: true,
      type: 'boolean',
      describe: 'whether or not to exclude all node_module folders (i.e. **/node_modules/**) by default'
    })
    .option('include', {
      alias: 'n',
      default: [],
      group: 'Reporting options',
      describe: 'a list of specific files that should be covered (glob patterns are supported)'
    })
    .option('exclude', {
      alias: 'x',
      default: defaultExclude,
      group: 'Reporting options',
      describe: 'a list of specific files and directories that should be excluded from coverage (glob patterns are supported)'
    })
    .option('extension', {
      alias: 'e',
      default: defaultExtension,
      group: 'Reporting options',
      describe: 'a list of specific file extensions that should be covered'
    })
    .option('exclude-after-remap', {
      alias: 'a',
      type: 'boolean',
      default: false,
      group: 'Reporting options',
      describe: 'apply exclude logic to files after they are remapped by a source-map'
    })
    .options('skip-full', {
      default: false,
      type: 'boolean',
      group: 'Reporting options',
      describe: 'do not show files with 100% statement, branch, and function coverage'
    })
    .option('check-coverage', {
      default: false,
      type: 'boolean',
      group: 'Coverage thresholds',
      description: 'check whether coverage is within thresholds provided'
    })
    .option('branches', {
      default: 0,
      group: 'Coverage thresholds',
      description: 'what % of branches must be covered?',
      type: 'number'
    })
    .option('functions', {
      default: 0,
      group: 'Coverage thresholds',
      description: 'what % of functions must be covered?',
      type: 'number'
    })
    .option('lines', {
      default: 90,
      group: 'Coverage thresholds',
      description: 'what % of lines must be covered?',
      type: 'number'
    })
    .option('statements', {
      default: 0,
      group: 'Coverage thresholds',
      description: 'what % of statements must be covered?',
      type: 'number'
    })
    .option('per-file', {
      default: false,
      group: 'Coverage thresholds',
      description: 'check thresholds per file',
      type: 'boolean'
    })
    .option('100', {
      default: false,
      group: 'Coverage thresholds',
      description: 'shortcut for --check-coverage --lines 100 --functions 100 --branches 100 --statements 100',
      type: 'boolean'
    })
    .option('temp-directory', {
      describe: 'directory V8 coverage data is written to and read from',
      default: process.env.NODE_V8_COVERAGE
    })
    .option('clean', {
      default: true,
      type: 'boolean',
      describe: 'should temp files be deleted before script execution'
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
    .options('allowExternal', {
      default: false,
      type: 'boolean',
      describe: 'supplying --allowExternal will cause c8 to allow files from outside of your cwd. This applies both to ' +
        'files discovered in coverage temp files and also src files discovered if using the --all flag.'
    })
    .options('merge-async', {
      default: false,
      type: 'boolean',
      describe: 'supplying --merge-async will merge all v8 coverage reports asynchronously and incrementally. ' +
        'This is to avoid OOM issues with Node.js runtime.'
    })
    .options('print-config', {
      default: false,
      type: 'boolean',
      describe: 'Print the derived configuration between command line parameters and loaded configuration file'
    })
    .options('print-config-format', {
      default: 'text',
      type: 'string',
      describe: 'Format to print the configuration in.  Accepted formats are either text or json'
    })
    .pkgConf('c8')
    .check((argv) => {
      if (!argv.tempDirectory) {
        argv.tempDirectory = resolve(argv.reportsDir, 'tmp')
      }
      return true
    })
    .epilog('visit https://git.io/vHysA for list of available reporters')

  // TODO: enable once yargs upgraded to v17: https://github.com/bcoe/c8/pull/332#discussion_r721636191
  // yargs.middleware((argv) => {
  //   if (!argv['100']) return argv

  //   return {
  //     ...argv,
  //     branches: 100,
  //     functions: 100,
  //     lines: 100,
  //     statements: 100,
  //   }
  // })

  const argv = process.argv.slice(2)
  const checkArgs = parser(argv)

  let shouldPrint = false

  if (Object.keys(checkArgs).includes('print-config')) {
    // checkArgs['print-config'] could contain a boolean or a string
    // representing a boolean.
    if (typeof checkArgs['print-config'] === 'boolean') {
      shouldPrint = checkArgs['print-config']
    } else if (typeof checkArgs['print-config'] === 'string') {
      shouldPrint = JSON.parse(checkArgs['print-config'])
    }
  }

  if (shouldPrint) {
    const commandExecutedReference = 'c8 ' + argv.join(' ')
    const args = yargs.parse(hideInstrumenteeArgs())
    const cleanArgs = cleanUpArgumentArray(args)

    if (args.printConfigFormat === 'text') {
      printConfigText(cleanArgs, commandExecutedReference)
    } else if (checkArgs.printConfigFormat === 'json') {
      const jsonYargs = JSON.stringify(cleanArgs, 2)
      console.log(jsonYargs)
    }

    process.exit()
  }

  yargs.demandCommand(1)

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
  let argv = process.argv.slice(1)
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

// Todo: Take a look at Optimizing this function
// exclude certain temporary values and duplicates from printing
// the same variable will be included twice with different keys
// for example args['temp-directory'] && args['tempDirectory']
// are essentially the same variable
function cleanUpArgumentArray (args) {
  const argsToPrint = {}
  Object.keys(args).forEach(v => {
    if (v && v.length > 1 && v !== '_' && v !== '$0') {
      // See if we are dealing with a Camel Case key string
      const matches = [...v.matchAll(/([A-Z])/g)]
      if (matches.length > 0) {
        matches.forEach(m => {
          // Derive Kebab Case string from Camel Case Key string
          const newKey = m.input.replace(/([A-Z])/g, '-$1').toLowerCase()
          // If the Kebab Case key is not assigned a value
          if (!args[newKey]) {
            // Then assigned it the Camel Case Variable
            argsToPrint[newKey] = args[v]
          } else if (!args[v]) {
            // Other wise assign keep the Kebab Case key value
            argsToPrint[newKey] = args[newKey]
          }
        })
      } else {
        // Just keep the value.  Either Kebab case or otherwise
        argsToPrint[v] = args[v]
      }
    }
  })

  return argsToPrint
}

function printConfigText (argsv, commandExecutedReference) {
  const banner = readFileSync('./c8-ascii-art.txt', 'utf-8')
  console.log('\n\n')
  console.log(banner)
  console.log('\n\n')
  console.log('Command Issued:     ' + commandExecutedReference)
  console.log('Config File Loaded: ' + argsv.config + '\n\n\n')
  console.log('Derived Configuration from CLI options and configuration file')
  console.log('------------------------------------------------------------------------------')

  const addSpace = (numOfSpace) => {
    let space = ''
    for (let i = 0; i < numOfSpace; i++) space += ' '
    const s = space
    return s
  }

  // Including some formatting variables
  // for spacing to make the output more readable
  let output = ''
  let spaceLength = Object.keys(argsv)
    .map(v => String(v).length)
    .reduce((p, c) => {
      return (p >= c) ? p : c
    })
  spaceLength += 10

  // For each configuration value, print pretty
  Object.keys(argsv).forEach(v => {
    const fillSpace = addSpace(spaceLength - v.length)
    const enumSpace = addSpace(spaceLength)
    const value = formatPrintVariable(argsv[v], enumSpace)
    output += String(v) + ':' + fillSpace + value + '\n'
  })
  console.log(output)
}

function formatPrintVariable (variable, space) {
  let value

  if (Array.isArray(variable) && variable.length > 0) {
    value = stringifyObject(variable, space, ']')
  } else if (typeof variable === 'object' && Object.keys(variable).length > 0) {
    value = stringifyObject(variable, space, '}')
  } else if (typeof variable === 'string' && variable) {
    value = "'" + variable + "'"
  } else if (typeof variable === 'string' && !variable) {
    value = "''"
  } else {
    value = variable
  }

  return value
}

function stringifyObject (variable, space, closingChar) {
  const closeReg = new RegExp('\n' + closingChar, 'g')
  const out = JSON.stringify(variable, null, '\t\t\t\t ')
    .replace(closeReg, '\n' + space + ' ' + closingChar)

  return out
}

module.exports = {
  buildYargs,
  hideInstrumenterArgs,
  hideInstrumenteeArgs
}
