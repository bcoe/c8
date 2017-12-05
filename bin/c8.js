#!/usr/bin/env node
'use strict'

const CRI = require('chrome-remote-interface')
const Exclude = require('test-exclude')
const {isAbsolute} = require('path')
const mkdirp = require('mkdirp')
const report = require('../lib/report')
const {resolve} = require('path')
const rimraf = require('rimraf')
const spawn = require('../lib/spawn')
const uuid = require('uuid')
const v8ToIstanbul = require('v8-to-istanbul')
const {writeFileSync} = require('fs')
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

;(async function executeWithCoverage (instrumenteeArgv) {
  try {
    const bin = instrumenteeArgv.shift()
    const info = await spawn(bin,
                             [`--inspect-brk=0`].concat(instrumenteeArgv))
    const client = await CRI({port: info.port})

    const initialPause = new Promise((resolve) => {
      client.once('Debugger.paused', resolve)
    })

    const mainContextInfo = new Promise((resolve) => {
      client.once('Runtime.executionContextCreated', (message) => {
        resolve(message.context)
      })
    })

    const executionComplete = new Promise((resolve) => {
      client.on('Runtime.executionContextDestroyed', async (message) => {
        if (message.executionContextId === (await mainContextInfo).id) {
          resolve(message)
        }
      })
    })

    const {Debugger, Runtime, Profiler} = client
    await Promise.all([
      Profiler.enable(),
      Runtime.enable(),
      Debugger.enable(),
      Profiler.startPreciseCoverage({callCount: true, detailed: true}),
      Runtime.runIfWaitingForDebugger(),
      initialPause
    ])
    await Debugger.resume()

    await executionComplete
    const allV8Coverage = await collectV8Coverage(Profiler)
    writeIstanbulFormatCoverage(allV8Coverage)
    await client.close()
    report({
      reporter: Array.isArray(argv.reporter) ? argv.reporter : [argv.reporter],
      coverageDirectory: argv.coverageDirectory,
      watermarks: argv.watermarks
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})(hideInstrumenterArgs(argv))

async function collectV8Coverage (Profiler) {
  let {result} = await Profiler.takePreciseCoverage()
  result = result.filter(({url}) => {
    url = url.replace('file://', '')
    return isAbsolute(url) && exclude.shouldInstrument(url)
  })
  return result
}

function writeIstanbulFormatCoverage (allV8Coverage) {
  const tmpDirctory = resolve(argv.coverageDirectory, './tmp')
  rimraf.sync(tmpDirctory)
  mkdirp.sync(tmpDirctory)
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
