const parser = require('yargs-parser')

/**
 * Function: printConfig
 *
 * Entry point for print config logic from lib/parse-args.js file
 * Kills process at the end of execution
 *
 * @param {Object} yargs: instance of populated yargs object
 * @param {Function} hideInstrumenteeArgs: Callback defined in lib/parse-arges
 * @returns {undefined}
 */
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

/**
 * Function: cleanUpArgumentArray
 *
 * Todo: Take a look at Optimizing this function.
 *
 * This function exclude duplicate values that have diffferent keys.
 * Additionally, scrubs convience key values.
 *
 * For example: args['temp-directory'] and args['tempDirectory']
 * are essentially the same variable
 *
 * @param {Object} args: key/value pairs of configuration options
 *  generated by yargs.parse()
 * @returns {Object} - Clone of args with duplicated data removed
 *
 *
 *
 */
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
            // Todo: these next 4 lines are not getting covered
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

/**
 * Function: printConfigText
 *
 * Todo: refactor output to use the console.table function
 *
 * @param {Object} argsv: sanitized configuration option object
 * @param {String} cmdExecuted: the string representing the
 *  command for c8 that passed to the cli.
 * @returns {undefined}
 */
function printConfigText (argsv, cmdExecuted) {
  const configFilePath = argsv instanceof Object &&
    Object.keys(argsv).includes('config')
    ? argsv.config
    : ''

  const banner = printConfigBanner(cmdExecuted, configFilePath)
  console.log(banner)

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


/**
 * Function: printConfigBanner
 *
 * @param {String} cmdExecuted: the string representing the
 *  command for c8 that passed to the cli.
 * @param {String} configFilePath: the abosulte path to
 *  the configuration file that was loaded
 * @returns {String} - the banner string to print
 *
 *
 */
function printConfigBanner (cmdExecuted, configFilePath) {
  return String.raw`


    /* ________/\\\\\\\\\_        _____/\\\\\\\\\____         */
    /*  _____/\\\////////__        ___/\\\///////\\\__        */
    /*   ___/\\\/___________        __\/\\\_____\/\\\__       */
    /*    __/\\\_____________        __\///\\\\\\\\\/___      */
    /*     _\/\\\_____________        ___/\\\///////\\\__     */
    /*      _\//\\\____________        __/\\\______\//\\\_    */
    /*       __\///\\\__________        _\//\\\______/\\\__   */
    /*        ____\////\\\\\\\\\_        __\///\\\\\\\\\/___  */
    /*         _______\/////////__        ____\/////////_____ */

    Command Issued:     ${cmdExecuted}
    Config File Loaded: ${configFilePath}


    Derived Configuration from CLI options and configuration file
    ------------------------------------------------------------------------------
  `.replaceAll(/\n{1} +/g, '\n')
}

/**
 * Function: formatPrintVariable
 *
 * @param {any} variable: the variable to format
 * @param {String} space: a string containing a variable
 *  amount of blank spaces
 * @returns {String} - string representation of the variable
 */
function formatPrintVariable (variable, space) {
  let value

  if (Array.isArray(variable) && variable.length > 0) {
    value = stringifyObject(variable, space, ']')
  // Todo: need a unit test for this line
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

/**
 * Function: stringifyObject
 * @param {any} variable: the variable to format
 * @param {String} spacea string containing a variable
 *  amount of blank spaces
 * @param {String} closingChar: single string character
 *  either a ']' or a '}'
 * @returns {String} - string representation of the variable
 */
function stringifyObject (variable, space, closingChar) {
  const closeReg = new RegExp('\n' + closingChar, 'g')
  const out = JSON.stringify(variable, null, '\t\t\t\t ')
    .replace(closeReg, '\n' + space + ' ' + closingChar)

  return out
}

module.exports = {
  printConfig
}