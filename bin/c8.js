#!/usr/bin/env node
'use strict'

const fs = require('fs')
const util = require('util')

const foreground = require('foreground-child')
const report = require('../lib/report')
const rimraf = require('rimraf')
const {
  hideInstrumenteeArgs,
  hideInstrumenterArgs,
  yargs
} = require('../lib/parse-args')

const instrumenterArgs = hideInstrumenteeArgs()
let argv = yargs.parse(instrumenterArgs)

const _p = util.promisify

function outputReport () {
  report({
    include: argv.include,
    exclude: argv.exclude,
    reporter: Array.isArray(argv.reporter) ? argv.reporter : [argv.reporter],
    tempDirectory: argv.tempDirectory,
    watermarks: argv.watermarks,
    resolve: argv.resolve,
    omitRelative: argv.omitRelative,
    wrapperLength: argv.wrapperLength
  })
}

(async function run () {
  if (argv._[0] === 'report') {
    argv = yargs.parse(process.argv) // support flag arguments after "report".
    outputReport()
  } else {
    if (argv.clean) {
      await _p(rimraf)(argv.tempDirectory)
      await _p(fs.mkdir)(argv.tempDirectory, { recursive: true })
    }
    process.env.NODE_V8_COVERAGE = argv.tempDirectory

    foreground(hideInstrumenterArgs(argv), () => {
      outputReport()
    })
  }
})()
