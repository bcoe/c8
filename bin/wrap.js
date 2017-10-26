const fs = require('fs')
const sw = require('spawn-wrap')
const CRI = require('chrome-remote-interface');
const getPort = require('get-port');
const inspector = require('inspector')

// if there are N or less active handles
// in the event loop, dump coverage and exit.
const EXIT_HANDLE_COUNT = 4

getPort().then(async port => {
  // start an inspector session on an unused port.
  inspector.open(port, true)
  const client = await CRI({port: port})
  const {Profiler} = client
  await Profiler.enable()
  await Profiler.startPreciseCoverage({callCount: true, detailed: true})

  // run the original "main" now that we've started the inspector.
  sw.runMain()

  // wait for everything in event loop to terminate
  // except for inspector session.
  setInterval(() => {
    const handleCount = process._getActiveHandles().length
      + process._getActiveRequests().length
    if (handleCount <= EXIT_HANDLE_COUNT) {
      outputCoverageAndExit(client, Profiler)
    }
  }, 100)
}).catch(err => {
  throw err
})

async function outputCoverageAndExit (client, Profiler) {
  const IGNORED_PATHS = [
    /\/bin\/wrap.js/,
    /\/node_modules\//,
    /node-spawn-wrap/
  ]
  let {result} = await Profiler.takePreciseCoverage()
  result = result.filter(coverage => {
    for (var ignored, i = 0; (ignored = IGNORED_PATHS[i]) !== undefined; i++) {
      if (ignored.test(coverage.url)) return false
    }
    if (!/^\//.test(coverage.url)) return false
    else return true
  })
  console.log(JSON.stringify(result, null, 2))
  client.close()
  process.exit(process.exitCode || 0)
}
