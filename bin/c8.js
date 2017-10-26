#!/usr/bin/env node

const argv = require('yargs').parse()
const foreground = require('foreground-child')
const sw = require('spawn-wrap')

if (argv._.length) {
  sw([require.resolve('./wrap')])
  foreground(process.argv.slice(2))
}
