#!/usr/bin/env node

'use strict'

const { promises } = require('fs')
const { promisify } = require('util')
const foreground = require('foreground-child')
const rimraf = require('rimraf')
const { outputReport } = require('../lib/commands/report')
const {
  buildYargs,
  hideInstrumenteeArgs,
  hideInstrumenterArgs
} = require('../lib/parse-args')

async function run () {
  const instrumenterArgs = hideInstrumenteeArgs()
  let argv = buildYargs().parse(instrumenterArgs)

  if (['check-coverage', 'report'].includes(argv._[0])) {
    argv = buildYargs(true).parse(process.argv.slice(2))
  } else {
    // fs.promises was not added until Node.js v10.0.0, if it doesn't
    // exist, assume we're Node.js v8.x and skip coverage.
    if (!promises) {
      foreground(hideInstrumenterArgs(argv))
      return
    }

    if (argv.clean) {
      await promisify(rimraf)(argv.tempDirectory)
    }

    await promises.mkdir(argv.tempDirectory, { recursive: true })
    process.env.NODE_V8_COVERAGE = argv.tempDirectory
    foreground(hideInstrumenterArgs(argv), async (done) => {
      try {
        await outputReport(argv)
      } catch (error) {
        console.error(error.stack)
        process.exitCode = 1
      }

      done()
    })
  }
}

run().catch(error => {
  console.error(error.stack)
  process.exitCode = 1
})
