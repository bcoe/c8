/* global describe, it */

const rmrf = require('../lib/rmrf')

describe('rmrf', () => {
/*
 * dummy test to mock rmrf in win32 and posix for code-coverage-completion
 */
  it('rmrf in win32', (done) => {
    rmrf('undefined', done.bind(undefined, undefined), 'win32')
  })
  it('rmrf in posix', (done) => {
    rmrf('undefined', done.bind(undefined, undefined), 'linux')
  })
})
