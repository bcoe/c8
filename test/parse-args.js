/* global describe, it */

const {
  buildYargs,
  hideInstrumenteeArgs,
  hideInstrumenterArgs
} = require('../lib/parse-args')

const { join } = require('path')

describe('parse-args', () => {
  describe('hideInstrumenteeArgs', () => {
    it('hides arguments passed to instrumented app', () => {
      process.argv = ['node', 'c8', '--foo=99', 'my-app', '--help']
      const instrumenterArgs = hideInstrumenteeArgs()
      instrumenterArgs.should.eql(['--foo=99', 'my-app'])
    })
  })

  describe('hideInstrumenterArgs', () => {
    it('hides arguments passed to c8 bin', () => {
      process.argv = ['node', 'c8', '--foo=99', 'my-app', '--help']
      const argv = buildYargs().parse(hideInstrumenteeArgs())
      const instrumenteeArgs = hideInstrumenterArgs(argv)
      instrumenteeArgs.should.eql(['my-app', '--help'])
      argv.tempDirectory.endsWith(join('coverage', 'tmp')).should.be.equal(true)
    })
  })

  describe('with NODE_V8_COVERAGE already set', () => {
    it('should not override it', () => {
      const NODE_V8_COVERAGE = process.env.NODE_V8_COVERAGE
      process.env.NODE_V8_COVERAGE = './coverage/tmp_'
      process.argv = ['node', 'c8', '--foo=99', 'my-app', '--help']
      const argv = buildYargs().parse(hideInstrumenteeArgs())
      argv.tempDirectory.endsWith('/coverage/tmp_').should.be.equal(true)
      process.env.NODE_V8_COVERAGE = NODE_V8_COVERAGE
    })
  })
})
