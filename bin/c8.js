#!/usr/bin/env node
'use strict'

const semver = require('semver')

/* c8 ignore next 3 */
if (semver.lt(process.version, '10.12.0')) {
  console.warn(`c8 requires Node v10.12.0 or greater, found ${process.version}`)
} else {
  require('./run')
}
