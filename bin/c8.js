#!/usr/bin/env node
'use strict'

const foreground = require('foreground-child')
const { outputReport } = require('../lib/commands/report')
const mkdirp = require('mkdirp')
const { promisify } = require('util')
const rimraf = require('rimraf')
const {
  buildYargs,
  hideInstrumenteeArgs,
  hideInstrumenterArgs
} = require('../lib/parse-args')

const instrumenterArgs = hideInstrumenteeArgs()
let argv = buildYargs().parse(instrumenterArgs)

async function run () {
  if ([
    'check-coverage', 'report'
  ].indexOf(argv._[0]) !== -1) {
    argv = buildYargs(true).parse(process.argv.slice(2))
  } else {
    if (argv.clean) {
      await promisify(rimraf)(argv.tempDirectory)
    }
    // allow c8 to run on Node 8 (coverage just won't work).
    await promisify(mkdirp)(argv.tempDirectory)

    process.env.NODE_V8_COVERAGE = argv.tempDirectory
    foreground(hideInstrumenterArgs(argv), async (done) => {
      await outputReport(argv)
      done()
    })
  }
}

run().catch((err) => {
  console.error(err.stack)
  process.exitCode = 1
})
