#!/usr/bin/env node
'use strict'

const {isAbsolute} = require('path')
const argv = require('yargs').parse()
const CRI = require('chrome-remote-interface')
const spawn = require('../lib/spawn')

;(async () => {
  try {
    const info = await spawn(process.execPath,
                             [`--inspect-brk=0`].concat(process.argv.slice(2)))                      
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
    await outputCoverage(Profiler)
    client.close()

  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()

async function outputCoverage (Profiler) {
  const IGNORED_PATHS = [
    /\/bin\/wrap.js/,
    /\/node_modules\//,
    /node-spawn-wrap/
  ]
  let {result} = await Profiler.takePreciseCoverage()
  result = result.filter(({url}) => {
    return isAbsolute(url) && IGNORED_PATHS.every(ignored => !ignored.test(url))
  })
  console.log(JSON.stringify(result, null, 2))
}
