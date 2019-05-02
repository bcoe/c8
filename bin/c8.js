#!/usr/bin/env node
'use strict'

const semver = require('semver')
const minNode = semver.minVersion(require('../package.json').engines.node)

/* c8 ignore next 3 */
if (semver.lt(process.version, minNode)) {
  console.warn(`c8 requires Node v${minNode} or greater, found ${process.version}`)
} else {
  require('./run')
}
