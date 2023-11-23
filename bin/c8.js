#!/usr/bin/env node
'use strict'

const { foregroundChild } = require('foreground-child')
const { outputReport } = require('../lib/commands/report')
const { promises } = require('fs')
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
    // fs.promises was not added until Node.js v10.0.0, if it doesn't
    // exist, assume we're Node.js v8.x and skip coverage.
    if (!promises) {
      foregroundChild(hideInstrumenterArgs(argv))
      return
    }

    if (argv.clean) {
      await promisify(rimraf)(argv.tempDirectory)
    }

    await promises.mkdir(argv.tempDirectory, { recursive: true })
    process.env.NODE_V8_COVERAGE = argv.tempDirectory
    foregroundChild(hideInstrumenterArgs(argv), async () => {
      try {
        await outputReport(argv)
      } catch (err) {
        console.error(err.stack)
        process.exit(1)
      }
    })
  }
}

run().catch((err) => {
  console.error(err.stack)
  process.exit(1)
})
