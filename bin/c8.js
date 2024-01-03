#!/usr/bin/env node
'use strict'

const foreground = require('foreground-child')
const { outputReport } = require('../lib/commands/report')
const { rm, mkdir } = require('fs/promises')
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
    foreground(hideInstrumenterArgs(argv))

    if (argv.clean) {
      await rm(argv.tempDirectory, { recursive: true, force: true })
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
