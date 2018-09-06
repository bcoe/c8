#!/usr/bin/env node
'use strict'

const Exclude = require('test-exclude')
const foreground = require('foreground-child')
const mkdirp = require('mkdirp')
const report = require('../lib/report')
const {resolve} = require('path')
const rimraf = require('rimraf')
const {
  hideInstrumenteeArgs,
  hideInstrumenterArgs,
  yargs
} = require('../lib/parse-args')
const instrumenterArgs = hideInstrumenteeArgs()
const argv = yargs.parse(instrumenterArgs)
const exclude = Exclude({
  include: argv.include,
  exclude: argv.exclude
})
const tmpDirctory = resolve(argv.coverageDirectory, './tmp')
rimraf.sync(tmpDirctory)
mkdirp.sync(tmpDirctory)

process.env.NODE_V8_COVERAGE = tmpDirctory

foreground(hideInstrumenterArgs(argv), (out) => {
  report({
    exclude: exclude,
    reporter: Array.isArray(argv.reporter) ? argv.reporter : [argv.reporter],
    coverageDirectory: argv.coverageDirectory,
    watermarks: argv.watermarks,
    resolve: argv.resolve
  })
})
