/* global describe, it, beforeEach, after */

const { assert } = require('chai')
const { existsSync } = require('fs')
const { resolve, join } = require('path')
const chaiJestSnapshot = require('chai-jest-snapshot')
const { spawnSync } = require('child_process')

const {
  buildYargs,
  hideInstrumenteeArgs,
  hideInstrumenterArgs,
  getConfigFileNames,
  loadConfigFile
} = require('../lib/parse-args')

const {
  testConfigFile,
  beforeTestReadingConfigFile,
  afterTestReadingConfigFile
} = require('./parse-args-helper.js')

require('chai')
  .use(chaiJestSnapshot)
  .should()

const c8Path = require.resolve('../bin/c8')
const nodePath = process.execPath

describe('parse-args', () => {
  describe('hideInstrumenteeArgs', () => {
    it('hides arguments passed to instrumented app', () => {
      process.argv = ['node', 'c8', '--foo=99', 'my-app', '--help']
      const instrumenterArgs = hideInstrumenteeArgs()
      instrumenterArgs.should.eql(['--foo=99', 'my-app'])
    })

    it('test early exit from function if no arguments are passed', () => {
      process.argv = []
      const instrumenterArgs = hideInstrumenteeArgs()
      instrumenterArgs.length.should.eql(0)
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

    it('interprets first args after -- as Node.js execArgv', async () => {
      const expected = [process.execPath, '--expose-gc', 'index.js']
      process.argv = ['node', 'c8', '--', '--expose-gc', 'index.js']
      const argv = buildYargs().parse(hideInstrumenteeArgs())
      const munged = hideInstrumenterArgs(argv)
      munged.should.deep.equal(expected)
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
    it('c8 process should throw an error message if an invalid configuration file name is passed', function () {
      const invalidConfig = './fixtures/config/.c8.config.py'
      const loadInvalidConfigFile = function (file, callBack) {
        try {
          callBack(file)
          assert.fail('Invalid configuration file loaded')
        } catch (error) {
          const expectErrorValue = `Error: Unsupported file type .py while reading file ${invalidConfig}`
          String(error).should.eql(expectErrorValue)
        }
      }

      loadInvalidConfigFile(invalidConfig, function (file) {
        loadConfigFile(file)
      })
    })

    it('config directory should contain all variations of the config file naming convention', () => {
      let count = 0
      const fileMessages = []
      const configFileList = getConfigFileNames()
      configFileList.forEach((file) => {
        const fullPath = './test/fixtures/config/' + file
        if (existsSync(fullPath)) {
          count++
        } else {
          fileMessages.push(`Missing ${file} from ./test/fixtures/config directory`)
        }
      })

      if (count === configFileList.length) {
        assert.equal(count, configFileList.length)
      } else {
        const msg = fileMessages.join(' \n      ')
        assert.equal(fileMessages.length, 0, msg)
      }
    })

    describe('should be able to read config files with .json, .yml, .yaml, .js, .cjs extensions', () => {
      const filePath = './fixtures/config/'
      const testData = {
        c8: {
          description: 'c8 variations of config file',
          fileNameLineNumberMap: {
            '.c8rc.json': 101,
            '.c8rc.yml': 69,
            '.c8rc.yaml': 10,
            'c8.config.js': 47,
            'c8.config.cjs': 51,
            '.c8rc.js': 22,
            '.c8rc.cjs': 32,
            '.c8.config.js': 47,
            '.c8.config.cjs': 45
          }
        },
        nyc: {
          description: 'nyc variations of config file',
          fileNameLineNumberMap: {
            '.nycrc': 51,
            '.nycrc.json': 96,
            '.nycrc.yml': 99,
            '.nycrc.yaml': 98,
            'nyc.config.js': 95,
            'nyc.config.cjs': 94,
            '.nyc.config.js': 85,
            '.nyc.config.cjs': 71
          }
        }
      }

      Object.keys(testData).forEach(key => {
        const { description, fileNameLineNumberMap } = testData[key]
        describe(description, function () {
          testConfigFile(filePath, fileNameLineNumberMap, function (fileName, expectedLines) {
            beforeEach(() => beforeTestReadingConfigFile(fileName))
            it(`should be able to resolve config file ${fileName} with --config flag`, () => {
              const configFilePath = join(filePath, fileName)
              const argv = buildYargs().parse(['node', 'c8', 'my-app', '--config', require.resolve(`./${configFilePath}`)])
              argv.lines.should.be.equal(expectedLines)
            })

            // skipping for the moment.  Need another patch for this test to successfully run
            it.skip(`should be able to resolve config file ${fileName} by detection`, function () {
              // set the snapshot filename
              chaiJestSnapshot.setTestName(`should be able to resolve config file ${fileName} by detection`)
              chaiJestSnapshot.setFilename('./test/fixtures/config/snapshots/' + fileName + '.snap')

              // Run V8 in the dir above
              const { output } = spawnSync(nodePath,
                [
                  c8Path,
                  '--temp-directory=tmp/normal',
                  '--all',
                  '--src=./test/fixtures/tmp-config-test',
                  nodePath,
                  require.resolve('./fixtures/tmp-config-test/normal.js')
                ],
                { cwd: './test/fixtures/tmp-config-test' }
              )
              output.toString('utf8').should.matchSnapshot()
            })
            after(afterTestReadingConfigFile)
          })
        })
      })
    })

    it('should resolve to .nycrc at cwd', () => {
      const argv = buildYargs().parse(['node', 'c8', 'my-app'])
      argv.lines.should.be.equal(95)
    })
    it('should use config file specified in --config', () => {
      const argv = buildYargs().parse(['node', 'c8', '--config', require.resolve('./fixtures/config/.c8rc.json')])
      argv.lines.should.be.equal(101)
      argv.tempDirectory.should.be.equal('./foo')
      argv.functions.should.be.equal(24)
    })
    it('should have -c as an alias', () => {
      const argv = buildYargs().parse(['node', 'c8', '-c', require.resolve('./fixtures/config/.c8rc.json')])
      argv.lines.should.be.equal(101)
      argv.tempDirectory.should.be.equal('./foo')
      argv.functions.should.be.equal(24)
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
    it('should allow relative path reports directories', () => {
      const argsArray = ['node', 'c8', '--lines', '100', '--reports-dir', './coverage_']
      const argv = buildYargs().parse(argsArray)
      argv.reportsDir.should.be.equal('./coverage_')
    })
    it('should allow relative path temporary directories', () => {
      const argsArray = ['node', 'c8', '--lines', '100', '--temp-directory', './coverage/tmp_']
      const argv = buildYargs().parse(argsArray)
      argv.tempDirectory.should.be.equal('./coverage/tmp_')
    })
    it('should allow absolute path reports directories', () => {
      const tmpDir = resolve(process.cwd(), 'coverage_')
      const argsArray = ['node', 'c8', '--lines', '100', '--reports-dir', tmpDir]
      const argv = buildYargs().parse(argsArray)
      argv.reportsDir.should.be.equal(tmpDir)
    })
    it('should allow absolute path temporary directories', () => {
      const tmpDir = resolve(process.cwd(), './coverage/tmp_')
      const argsArray = ['node', 'c8', '--lines', '100', '--temp-directory', tmpDir]
      const argv = buildYargs().parse(argsArray)
      argv.tempDirectory.should.be.equal(tmpDir)
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
