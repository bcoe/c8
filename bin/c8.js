#!/usr/bin/env node
'use strict'

const minNode = `10.12.0`
const semver = require('semver')

/* c8 ignore next 3 */
if (semver.lt(process.version, minNode)) {
  console.warn(`c8 requires Node v${minNode} or greater, found ${process.version}`)
} else {
  require('./run')
}
