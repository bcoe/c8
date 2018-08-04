#!/usr/bin/env node
'use strict'

const { writeFileSync } = require('fs')
const { resolve } = require('path')
const onExit = require('signal-exit')
const sw = require('spawn-wrap')
const uuid = require('uuid')
const run = require('./run')

const argv = JSON.parse(process.env.C8_ARGV)

wrap()

async function wrap () {
  const result = await run(argv, async () => {
    sw.runMain()
    return new Promise((resolve) => onExit(resolve, { alwaysLast: true }))
  })
  write(result, { argv })
}

function write (coverage, { argv }) {
  const tmpDirectory = resolve(argv.coverageDirectory, './tmp')
  coverage.forEach((istanbul) => {
    writeFileSync(
      resolve(tmpDirectory, `./${uuid.v4()}.json`),
      JSON.stringify(istanbul, null, 2),
      'utf8'
    )
  })
}
