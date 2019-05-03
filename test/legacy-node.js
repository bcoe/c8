/* global describe, it */

const { execFile } = require('child_process')
const { mkdir } = require('fs').promises
const { join } = require('path')
const { promisify } = require('util')
const c8Path = require.resolve('./fixtures/disable-fs-promises')
const nodePath = process.execPath

describe('c8 on Node.js < 10', () => {
  it('doesn\'t crash', async () => {
    await mkdir(join(__dirname, '..', 'tmp', 'legacy-nodejs'))
    await promisify(execFile)(nodePath, [
      c8Path,
      '--temp-directory=tmp/legacy-nodejs',
      'node',
      '--version'
    ])
  })
})
