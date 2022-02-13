#!/usr/bin/env node
'use strict'

const { mkdir } = require('fs').promises
const { promisify } = require('util')
const foreground = require('foreground-child')
const rimraf = require('rimraf')
const { outputReport } = require('../lib/commands/report')
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

    await mkdir(argv.tempDirectory, { recursive: true })
    process.env.NODE_V8_COVERAGE = argv.tempDirectory
    foreground(hideInstrumenterArgs(argv), async (done) => {
      try {
        await outputReport(argv)
      } catch (err) {
        console.error(err.stack)
        process.exitCode = 1
      }
      done()
    })
  }
}

run().catch((err) => {
  console.error(err.stack)
  process.exitCode = 1
})
