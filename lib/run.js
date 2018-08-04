'use strict'

const Exclude = require('test-exclude')
const inspector = require('inspector')
const { isAbsolute } = require('path')
const v8ToIstanbul = require('v8-to-istanbul')

module.exports = async function (argv, cb) {
  const exclude = Exclude({
    include: argv.include,
    exclude: argv.exclude
  })

  const session = bootstrap()

  const done = () => {
    return onExit(session, { exclude, argv })
  }

  const cbResult = cb()
  if (cbResult.then) {
    return cbResult.then(done)
  } else {
    throw new Error('Callback needs to return a promise')
  }
}

function bootstrap () {
  // bootstrap the inspector before kicking
  // off the user's code.
  inspector.open(0, true)
  const session = new inspector.Session()
  session.connect()

  session.post('Profiler.enable')
  session.post('Runtime.enable')
  session.post(
    'Profiler.startPreciseCoverage', { callCount: true, detailed: true }
  )
  return session
}

function onExit (session, opts) {
  return new Promise((resolve, reject) => {
    session.post('Profiler.takePreciseCoverage', (err, res) => {
      if (err) reject(err)
      else {
        try {
          const result = getIstanbulFormatCoverage(filterResult(res.result, opts))
          resolve(result)
        } catch (err) {
          reject(err)
        }
      }
    })
  })
}

function filterResult (result, { exclude }) {
  result = result.filter(({ url }) => {
    url = url.replace('file://', '')
    return isAbsolute(url) &&
      exclude.shouldInstrument(url) &&
      url !== __filename
  })
  return result
}

function getIstanbulFormatCoverage (allV8Coverage) {
  return allV8Coverage.map((v8) => {
    const script = v8ToIstanbul(v8.url)
    script.applyCoverage(v8.functions)
    return script.toIstanbul()
  })
}
