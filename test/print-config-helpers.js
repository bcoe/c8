const { spawnSync } = require('child_process')
const os = require('os')

const nodePath = process.execPath
const isWin = (os.platform() === 'win32')
const pwd = process.cwd()
const whiteSpaceReg = /[\\\s]/g
const pwdReg = new RegExp(pwd, 'g')

/**
 * Function: runSpawn
 *
 * @param {Array} args: array of arguments to pass
 *  to child spawned process
 * @param {Boolean} text=false: expect json or cli
 *  text to be returned
 * @param {Boolean} stripWhiteSpace=false: should all
 *  whitespace be removed from the `out` string?
 * @returns {String} out: a string representing the stdout
 *   of the child process
 *
 * Todo:  Whitespace for snapshops is showing up in
 * different amounts on different os platforms.
 *
 * I am concern about this issue in the chai-snapshot
 * package.
 *
 * Issue described in jest
 * https://github.com/jestjs/jest/pull/9203
 *
 * Last time chai-jest-snapshot was publish was 6
 * years ago.
 *
 * https://www.npmjs.com/package/chai-jest-snapshot?activeTab=versions
 *
 * Alternative packages that might work.
 *
 * https://www.npmjs.com/package/mocha-chai-jest-snapshot
 *
 * https://www.npmjs.com/package/chai-snapshot-matcher/v/2.0.2
 *
 *
 */
const runSpawn = (args, text = false, stripWhiteSpace = false) => {
  const doubleQuoteReg = /"/g
  const slashReg = /\\/g

  const { output } = spawnSync(nodePath, args)

  let out = output.toString('utf8')

  if (isWin && text) {
    const jsonEncodedPwd = JSON.stringify(pwd)
      .replace(doubleQuoteReg, '')
    const encodedPwdRegEx = new RegExp(jsonEncodedPwd, 'g')
    out = out.replace(encodedPwdRegEx, '.')
  } else if (isWin && !text) {
    const jsonEncodedPwd = JSON.stringify(pwd)
      .replace(doubleQuoteReg, '')
      .replace(slashReg, '\\\\')
    const encodedPwdRegEx = new RegExp(jsonEncodedPwd, 'g')
    out = out.replace(encodedPwdRegEx, '.')
  } else if (!isWin) {
    out = out.replace(pwdReg, '.')
  }

  // Todo: For certain cases we need to strip out all whitespace in
  // snapshots. See notes above
  if (text && stripWhiteSpace) { out = out.replace(whiteSpaceReg, '') }

  if (!text) { out = cleanJson(out) }

  return out
}

/**
 * Function: cleanJson
 *
 * JSON needs to get scrubbed from additional characters
 * when being read from SpawnSync
 *
 * @param {String} out: string of json to scrub
 * @returns {String} - valid json object
 *
 */
const cleanJson = (out) => {
  const o = out.substring(1)
    .substring(0, out.length - 2)
    .replace(pwdReg, '.')

  return JSON.parse(o)
}

/**
 * Function: textGetConfigKey
 *
 * Get a value of a configuration key from text input
 *
 * @param {String} out: utf-8 formated output from
 *  child process of c8 with --print-config flag
 * @param {String} key: of configuration setting
 *  to return
 * @returns {String|null}: value of key, if
 *  found or null
 *
 */
const textGetConfigKey = (out, key) => {
  const newLineReturn = (isWin) ? '\r\n' : '\n'
  const newLineRegEx = new RegExp(newLineReturn, 'g')

  let value = null
  const keyReg = new RegExp(key + ':.+', 'g')
  const matches = [...out.matchAll(keyReg)]
  if (matches.length > 0 && typeof matches[0][0] === 'string') {
    const fileName = matches[0][0].replace(newLineRegEx, '')
      .replace(key + ':', '')
      .replace(whiteSpaceReg, '')
      .replace(/'/g, '')
    value = fileName
  }

  return value
}

module.exports = { runSpawn, cleanJson, textGetConfigKey }
