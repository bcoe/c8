#!/usr/bin/env node
'use strict'

const { foregroundChild } = require('foreground-child')
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
    if (argv.clean) {
      await rm(argv.tempDirectory, { recursive: true, force: true })
    }

    await mkdir(argv.tempDirectory, { recursive: true })
    process.env.NODE_V8_COVERAGE = argv.tempDirectory
    foregroundChild(hideInstrumenterArgs(argv), async () => {
      try {
        await outputReport(argv)
        return process.exitCode
      } catch (err) {
        console.error(err.stack)
        return 1
      }
    })
  }
}

run().catch((err) => {
  console.error(err.stack)
  process.exitCode = 1
})
