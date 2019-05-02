#!/usr/bin/env node
'use strict'

const semver = require('semver')

if (semver.lt(process.version, '10.0.0')) {
  /* c8 ignore next */
  console.warn(`c8 requires Node v10.0.0 or greater, found ${process.version}`)
} else {
  require('./run')
}
