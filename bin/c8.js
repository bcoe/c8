#!/usr/bin/env node
'use strict'

const fs = require('fs')
const foreground = require('foreground-child')
const { outputReport } = require('../lib/commands/report')
const { promisify } = require('util')
const rimraf = require('rimraf')
const {
  buildYargs,
  hideInstrumenteeArgs,
  hideInstrumenterArgs
} = require('../lib/parse-args')

const instrumenterArgs = hideInstrumenteeArgs()
let argv = buildYargs().parse(instrumenterArgs)

;(async function run () {
  if ([
    'check-coverage', 'report'
  ].indexOf(argv._[0]) !== -1) {
    argv = buildYargs(true).parse(process.argv.slice(2))
  } else {
    if (argv.clean) {
      await promisify(rimraf)(argv.tempDirectory)
      await promisify(fs.mkdir)(argv.tempDirectory, { recursive: true })
    }

    process.env.NODE_V8_COVERAGE = argv.tempDirectory
    foreground(hideInstrumenterArgs(argv), () => {
      outputReport(argv)
    })
  }
})()
