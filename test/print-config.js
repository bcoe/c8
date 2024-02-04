/* global describe, before, it */

const { rm } = require('fs')
const os = require('os')
const { expect } = require('chai')
const chaiJestSnapshot = require('chai-jest-snapshot')

const { runSpawn, textGetConfigKey } = require('./print-config-helpers')
const c8Path = require.resolve('../bin/c8')

require('chai')
  .use(chaiJestSnapshot)

const isWin = (os.platform() === 'win32')
const OsStr = (isWin) ? 'windows' : 'unix'
describe(`print derived configuration CLI option - ${OsStr}`, function () {
  before(cb => rm('tmp', { recursive: true, force: true }, cb))
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
      expect(out).to.matchSnapshot()
    } catch (e) {
      expect.fail('invalid json document produced from --print-config option')
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
  it.skip('ensure comma delimited values transform into an array', function () {
    const out = runSpawn([
      c8Path,
      '--reporter=lcov,text',
      '--print-config',
      '--print-config-format=json'
    ])

    expect(Object.keys(out).includes('reporter')).to.equal(true)
    expect(out.reporter).to.eql(['lcov', 'text'])
  })

  /**
   *
   *  Test: Ensure default project configuration file is loaded
   *  Command: c8  --print-config
   *
   */
  it('ensure default project configuration file is loaded', function () {
    const out = runSpawn([c8Path, '--print-config', '--print-config-format=json'])

    expect(Object.keys(out).includes('config')).to.equal(true)
    out.config.endsWith('.nycrc')
  })

  ;['text', 'json'].forEach((format) => {
    describe(`${format} format option`, function () {
      const textParam = format === 'text'

      /**
       *
       *  Test: ensure loads config file from cli
       *  Command: c8 -c ./test/fixtures/config/.c8rc.json --print-config --print-config-format=json|text
       *
       */
      it('ensure loads config file from cli', function () {
        // Can I shorten this line?
        const configFile = './test/fixtures/config/.c8rc.json'
        const out = runSpawn([
          c8Path,
          `--config=${configFile}`,
          '--print-config',
          `--print-config-format=${format}`
        ], textParam)

        if (format === 'json') // eslint-disable-line
          expect(Object.keys(out)
            .includes('config')).to.equal(true)

        const value = (format === 'json')
          ? out.config
          : textGetConfigKey(out, 'config')

        if (!value) // eslint-disable-line
          expect
            .fail('couldn\'t find configuration value for option --config')

        expect(value).to.eql(configFile)
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

        if (format === 'json') // eslint-disable-line
          expect(Object.keys(out)
            .includes('reporter')).to.equal(true)

        const value = (format === 'json')
          ? out.reporter
          : textGetConfigKey(out, 'reporter')

        if (!value) // eslint-disable-line
          expect
            .fail('couldn\'t find configuration value for option --reporter')

        // Todo: when the load comma delimited text array bug is fixed, need to adjust this line
        expect(value).to.eql('lcov')
      })
    })
  })
})
