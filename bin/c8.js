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
let argv = parseArgs(instrumenterArgs)

function parseArgs (args, withCommands = false) {
  if (process.platform === 'win32') {
    // cmd.exe leaves single quotes around arguments in npm scripts.
    for (let i = 0; i < args.length && args[i] !== '--'; i++) {
      const option = /^(?:--exclude|-x)(?:=(.*))?$/s.exec(args[i])
      if (!option) continue
      const inline = option[1]
      const pattern = inline ?? args[i + 1]
      if (/^'.*'$/s.test(pattern)) {
        // Yargs handles the quotes on --exclude=value, including values starting with '-'.
        args.splice(i, inline === undefined ? 2 : 1, `--exclude=${pattern}`)
      }
    }
  }
  return buildYargs(withCommands).parse(args)
}

async function run () {
  if ([
    'check-coverage', 'report'
  ].indexOf(argv._[0]) !== -1) {
    argv = parseArgs(process.argv.slice(2), true)
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
