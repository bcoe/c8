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

  describe('--config', () => {
    it('should resolve to .nycrc at cwd', () => {
      const argv = buildYargs().parse(['node', 'c8', 'my-app'])
      argv.lines.should.be.equal(95)
    })
    it('should use config file specified in --config', () => {
      const argv = buildYargs().parse(['node', 'c8', '--config', require.resolve('./fixtures/config/.c8rc.json')])
      argv.lines.should.be.equal(101)
      argv.tempDirectory.should.be.equal('./foo')
    })
    it('should have -c as an alias', () => {
      const argv = buildYargs().parse(['node', 'c8', '-c', require.resolve('./fixtures/config/.c8rc.json')])
      argv.lines.should.be.equal(101)
      argv.tempDirectory.should.be.equal('./foo')
    })
    it('should respect options on the command line over config file', () => {
      const argv = buildYargs().parse(['node', 'c8', '--lines', '100', '--config', require.resolve('./fixtures/config/.c8rc.json')])
      argv.lines.should.be.equal(100)
    })
    it('should allow config files to extend each other', () => {
      const argv = buildYargs().parse(['node', 'c8', '--lines', '100', '--config', require.resolve('./fixtures/config/.c8rc-base.json')])
      argv.branches.should.be.equal(55)
      argv.lines.should.be.equal(100)
      argv.functions.should.be.equal(24)
    })
  })

  describe('--merge-async', () => {
    it('should default to false', () => {
      const argv = buildYargs().parse(['node', 'c8'])
      argv.mergeAsync.should.be.equal(false)
    })

    it('should set to true when flag exists', () => {
      const argv = buildYargs().parse(['node', 'c8', '--merge-async'])
      argv.mergeAsync.should.be.equal(true)
    })
  })
})
