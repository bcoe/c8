/* global describe, it */

const {
  hideInstrumenteeArgs,
  hideInstrumenterArgs,
  yargs
} = require('../lib/parse-args')

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
      const argv = yargs.parse(hideInstrumenteeArgs())
      const instrumenteeArgs = hideInstrumenterArgs(argv)
      instrumenteeArgs.should.eql(['my-app', '--help'])
    })
  })
})
