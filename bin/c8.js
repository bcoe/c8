#!/usr/bin/env node
'use strict'

const foreground = require('foreground-child')
const report = require('../lib/report')
const sw = require('spawn-wrap')
const {
  hideInstrumenteeArgs,
  hideInstrumenterArgs,
  yargs
} = require('../lib/parse-args')

const instrumenterArgs = hideInstrumenteeArgs()
const argv = yargs.parse(instrumenterArgs)

sw([require.resolve('../lib/wrap')], {
  C8_ARGV: JSON.stringify(argv)
})

foreground(hideInstrumenterArgs(argv), (out) => {
  report({
    reporter: Array.isArray(argv.reporter) ? argv.reporter : [argv.reporter],
    coverageDirectory: argv.coverageDirectory,
    watermarks: argv.watermarks
  })
})
