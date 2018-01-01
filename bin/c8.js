#!/usr/bin/env node
'use strict'

const foreground = require('foreground-child')
const mkdirp = require('mkdirp')
const report = require('../lib/report')
const {resolve} = require('path')
const rimraf = require('rimraf')
const sw = require('spawn-wrap')
const {
  hideInstrumenteeArgs,
  hideInstrumenterArgs,
  yargs
} = require('../lib/parse-args')

const instrumenterArgs = hideInstrumenteeArgs()

const argv = yargs.parse(instrumenterArgs)

const tmpDirctory = resolve(argv.coverageDirectory, './tmp')
rimraf.sync(tmpDirctory)
mkdirp.sync(tmpDirctory)

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
