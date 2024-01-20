/* global describe, before, beforeEach, it */

const { rm } = require('fs')
const { runSpawn, textGetConfigKey } = require('./print-config-helpers')
const c8Path = require.resolve('../bin/c8')
const os = require('os')
const isWin = (os.platform() === 'win32')
const OsStr = (isWin) ? 'windows' : 'unix'
const chaiJestSnapshot = require('chai-jest-snapshot')
const { assert } = require('chai')

require('chai').should()
require('chai')
  .use(chaiJestSnapshot)
  .should()

before(cb => rm('tmp', { recursive: true, force: true }, cb))

beforeEach(function () {
  chaiJestSnapshot.configureUsingMochaContext(this)
})

describe(`print derived configuration CLI option - ${OsStr}`, function () {
  /**
   *
   *  Test: Ensure Valid JSON
   *  Command: c8 --print-config --print-config-format=json
   *
   *  ensure --print-config-format=json prints valid json document
   */
  it('ensure valid json', function () {
    chaiJestSnapshot.setTestName('ensure valid json')
    chaiJestSnapshot.setFilename(`./test/print-config-${OsStr}.js.snap`)

    try {
      const out = runSpawn([c8Path, '--print-config', '--print-config-format=json'])
      out.should.matchSnapshot()
    } catch (e) {
      assert.fail('invalid json document produced from --print-config option')
    }
  })

  /**
   *
   *  Test: Ensure comma delimited values transform into an array
   *  Command: C8 --reporter=lcov,text --print-config --print-config-format=json
   *
   *  Todo:  There is a bug in yargs where this is not transformedd into an array
   *   Skipping test for now
   */
  it('ensure comma delimited values transform into an array', function () {
    this.skip()
    const out = runSpawn([
      c8Path,
      '--reporter=lcov,text',
      '--print-config',
      '--print-config-format=json'
    ])

    const includesKey = Object.keys(out).includes('reporter')
    const checkFor = ['lcov', 'text']
    includesKey.should.eql(true)
    out.reporter.should.eql(checkFor)
  })

  /**
   *
   *  Test: Ensure default project configuration file is loaded
   *  Command: c8  --print-config
   *
   */
  it('ensure default project configuration file is loaded', function () {
    const out = runSpawn([c8Path, '--print-config', '--print-config-format=json'])

    const includesKey = Object.keys(out).includes('config')
    includesKey.should.eql(true)
    out.config.endsWith('.nycrc')
  })

  ;['text', 'json'].forEach((format) => {
    describe(`${format} format option`, function () {
      // Can I shorten this line?
      const textParam = (format === 'text')

      /**
       *
       *  Test: ensure loads config file from cli
       *  Command: c8 -c ./test/fixtures/config/.c8rc.json --print-config --print-config-format=json|text
       *
       */
      it('ensure loads config file from cli', function () {
        // Can I shorten this line?
        const out = runSpawn([
          c8Path,
          '--config=./test/fixtures/config/.c8rc.json',
          '--print-config',
          `--print-config-format=${format}`
        ], textParam)

        if (format === 'json') {
          const includesKey = Object.keys(out).includes('config')
          includesKey.should.eql(true)
          out.config.should.eql('./test/fixtures/config/.c8rc.json')
        } else if (format === 'text') {
          const value = textGetConfigKey(out, 'config')
          if (value) {
            value.should.eql('./test/fixtures/config/.c8rc.json')
          } else {
            assert.fail('couldn\'t find configuration value for option --config')
          }
        }
      })

      /**
       *
       *  Test: Ensure loads reporter option from cli
       *  Command: c8 --reporter=lcov --print-config
       *
       */
      it('ensure loads reporter option from cli', function () {
        const out = runSpawn([
          c8Path,
          '--reporter=lcov',
          '--print-config',
          `--print-config-format=${format}`
        ], textParam)

        if (format === 'json') {
          const includesKey = Object.keys(out).includes('reporter')
          includesKey.should.eql(true)
          out.reporter.should.eql('lcov')
        } else if (format === 'text') {
          const value = textGetConfigKey(out, 'reporter')
          if (value) {
            // Todo: when the load comma delimited text array bug is fixed, need to adjust this line
            value.should.eql('lcov')
          } else {
            assert.fail('couldn\'t find configuration value for option --reporter')
          }
        }
      })
    })
  })
})
