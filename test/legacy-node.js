/* global describe, it */

const { execFile } = require('child_process')
const { existsSync } = require('fs')
const { join } = require('path')
const { promisify } = require('util')
const c8Path = require.resolve('./fixtures/disable-fs-promises')

describe('c8 on Node.js < 10', () => {
  it('skip coverage', async () => {
    const tmp = join(__dirname, '..', 'tmp', 'legacy-nodejs')

    await promisify(execFile)(process.execPath, [
      c8Path,
      `--temp-directory=${__filename}`,
      process.execPath,
      '--version'
    ])

    existsSync(tmp).should.equal(false)
  })
})
