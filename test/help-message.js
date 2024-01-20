/* global describe, before, beforeEach, it */

const { runSpawn } = require('./print-config-helpers')
const c8Path = require.resolve('../bin/c8')
const { rm } = require('fs')
const os = require('os')
const isWin = (os.platform() === 'win32')
const OsStr = (isWin) ? 'windows' : 'unix'
const shouldCompressSnapShot = true
const nodePath = process.execPath

const chaiJestSnapshot = require('chai-jest-snapshot')
require('chai').should()
require('chai')
  .use(chaiJestSnapshot)
  .should()

before(cb => rm('tmp', { recursive: true, force: true }, cb))

beforeEach(function () {
  chaiJestSnapshot.configureUsingMochaContext(this)
})

describe(`Help Message - ${OsStr}`, function () {
  // Ensure the help message is correct - Snapshot of help message
  /**
   *   Test: Ensure Help Message is Correct
   *   Command: c8 --help
   *
   *   Runs the hep option and compares to a snapshot
   */
  it('ensure the help message is correct', function () {
    chaiJestSnapshot.setTestName('ensure the help message is correct')
    chaiJestSnapshot.setFilename(`./test/help-message-${OsStr}.js.snap`)
    const output = runSpawn([c8Path, '--help'], true, shouldCompressSnapShot)

    output.should.matchSnapshot()
  })

  describe('should demand arguments', function () {
    /**
     *  Test: Ensure 'not enough non-option arguments' warning message
     *  Command: c8
     *
     *  Runs c8 with incorrect options to make sure it produces a warning
     *
     */
    it('ensure warning message', function () {
      chaiJestSnapshot.setTestName('ensure warning message')
      chaiJestSnapshot.setFilename(`./test/help-message-${OsStr}.js.snap`)
      const output = runSpawn([c8Path], true, shouldCompressSnapShot)

      output.should.matchSnapshot()
    })

    /**
     *
     *  Test: should demand arguments: --print-config=false
     *  Command: c8 --print-config=false
     *
     */
    it('--print-config=false', function () {
      chaiJestSnapshot.setTestName('--print-config=false')
      chaiJestSnapshot.setFilename(`./test/help-message-${OsStr}.js.snap`)
      const out = runSpawn([c8Path, '--print-config=false'], true, shouldCompressSnapShot)
      out.should.matchSnapshot()
    })
  })

  describe('should not demand arguments', function () {
    /**
     *
     *  Test: should not demand any arguments: --print-config=true
     *  Command: c8 --print-config=true
     *
     *  if print-config is true, c8 shouldn't demand any arguments
     *
     */
    it('--print-config=true', function () {
      chaiJestSnapshot.setTestName('--print-config=true')
      chaiJestSnapshot.setFilename(`./test/help-message-${OsStr}.js.snap`)
      const out = runSpawn([c8Path, '--print-config=true'], true, shouldCompressSnapShot)
      out.should.matchSnapshot()
    })

    /**
     *
     *  Test: should not demand any arguments: --print-config
     *  Command: c8  --print-config
     *
     *  Other variation of if print-config is true, c8 shouldn't
     *  demand any arguments
     *
     */
    it('--print-config', function () {
      chaiJestSnapshot.setTestName('--print-config')
      chaiJestSnapshot.setFilename(`./test/help-message-${OsStr}.js.snap`)
      const out = runSpawn([c8Path, '--print-config'], true, shouldCompressSnapShot)
      out.should.matchSnapshot()
    })

    /**
     *
     *  Test: should not demand arguments: --print-config=false
     *  Command: c8 --print-config=false --temp-directory=tmp/vanilla-all \
     *   --clean=false --all=true --include=test/fixtures/all/vanilla/**\/*.js
     *   --exclude=**\/*.ts node ./fixtures/all/vanilla/main
     *
     */
    it('--print-config=false', function () {
      chaiJestSnapshot.setTestName('--print-config=false')
      chaiJestSnapshot.setFilename(`./test/help-message-${OsStr}.js.snap`)
      const args = [
        c8Path,
        '--print-config=false',
        '--temp-directory=tmp/vanilla-all',
        '--clean=false',
        '--all=true',
        '--include=test/fixtures/all/vanilla/**/*.js',
        '--exclude=**/*.ts', // add an exclude to avoid default excludes of test/**
        nodePath,
        require.resolve('./fixtures/all/vanilla/main')
      ]
      const out = runSpawn(args, true, shouldCompressSnapShot)
      out.should.matchSnapshot()
    })
  })
})
