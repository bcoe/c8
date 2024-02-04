const parser = require('yargs-parser')
const { readFileSync } = require('fs')

function printConfig (yargs, hideInstrumenteeArgs) {
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
    const args = yargs.parse(hideInstrumenteeArgs())
    const cmdExecuted = 'c8 ' + argv.join(' ')
    const cleanArgs = cleanUpArgumentArray(args)

    if (args.printConfigFormat === 'text') {
      printConfigText(cleanArgs, cmdExecuted)
    } else if (checkArgs.printConfigFormat === 'json') {
      const jsonYargs = JSON.stringify(cleanArgs, 2)
      console.log(jsonYargs)
    }

    process.exit()
  }
}

/** Todo: Refactor.  Add jsdocs styled comments.  Put functions below in their own file */
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
  /**
   *  Todo: Refactor: Put this line in a string literal
   *
   */
  const banner = readFileSync('./c8-ascii-art.txt', 'utf-8')
  console.log('\n\n')
  console.log(banner)
  console.log('\n\n')
  console.log('Command Issued:     ' + commandExecutedReference)
  console.log('Config File Loaded: ' + argsv.config + '\n\n\n')
  console.log('Derived Configuration from CLI options and configuration file')
  console.log('------------------------------------------------------------------------------')
  /* End refactor note */

  const addSpace = (numOfSpace) => {
    let space = ''
    for (let i = 0; i < numOfSpace; i++) space += ' '
    const s = space
    return s
  }

  /** Todo: Refactor:
   *  Put in a console.table format.
   *
   */
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
  /** End Refactor */
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
  printConfig
}
