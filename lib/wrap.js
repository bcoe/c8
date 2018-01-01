#!/usr/bin/env node
'use strict'

const Exclude = require('test-exclude')
const inspector = require('inspector')
const {isAbsolute} = require('path')
const onExit = require('signal-exit')
const {resolve} = require('path')
const sw = require('spawn-wrap')
const uuid = require('uuid')
const v8ToIstanbul = require('v8-to-istanbul')
const {writeFileSync} = require('fs')

const argv = JSON.parse(process.env.C8_ARGV)

const exclude = Exclude({
  include: argv.include,
  exclude: argv.exclude
})

;(async function runInstrumented () {
  try {
    // bootstrap the inspector before kicking
    // off the user's code.
    inspector.open(0, true)
    const session = new inspector.Session()
    session.connect()

    session.post('Profiler.enable')
    session.post('Runtime.enable')
    session.post(
      'Profiler.startPreciseCoverage',
      {callCount: true, detailed: true}
    )

    // hook process.exit() and common exit signals, e.g., SIGTERM,
    // and output coverage report when these occur.
    onExit(() => {
      session.post('Profiler.takePreciseCoverage', (err, res) => {
        if (err) console.warn(err.message)
        else {
          try {
            const result = filterResult(res.result)
            writeIstanbulFormatCoverage(result)
          } catch (err) {
            console.warn(err.message)
          }
        }
      })
    }, {alwaysLast: true})

    // run the user's actual application.
    sw.runMain()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()

function filterResult (result) {
  result = result.filter(({url}) => {
    url = url.replace('file://', '')
    return isAbsolute(url) &&
      exclude.shouldInstrument(url) &&
      url !== __filename
  })
  return result
}

function writeIstanbulFormatCoverage (allV8Coverage) {
  const tmpDirctory = resolve(argv.coverageDirectory, './tmp')
  allV8Coverage.forEach((v8) => {
    const script = v8ToIstanbul(v8.url)
    script.applyCoverage(v8.functions)
    writeFileSync(
      resolve(tmpDirctory, `./${uuid.v4()}.json`),
      JSON.stringify(script.toIstanbul(), null, 2),
      'utf8'
    )
  })
}
