const {spawn} = require('child_process')

const debuggerRe = /Debugger listening on ws:\/\/[^:]*:([^/]*)/

module.exports = function (execPath, args=[]) {
  const info = {
    port: -1
  }
  return new Promise((resolve, reject) => {
    const proc = spawn(execPath, args, {
      stdio: [process.stdin, process.stdout, 'pipe'],
      env: process.env,
      cwd: process.cwd()
    });

    proc.stderr.on('data', (outBuffer) => {
      const outString = outBuffer.toString('utf8')
      const match = outString.match(debuggerRe)
      if (match && !info.url) {
        info.port = Number(match[1])
        return resolve(info)
      } else {
        console.error(outString)
      }
    })
    
    proc.on('close', (code) => {
      if (info.port === -1) {
        return reject(Error('could not connect to inspector'))
      }
    })
  })
}