/* global describe, before, it */

const { rm } = require('fs')
const os = require('os')
const chaiJestSnapshot = require('chai-jest-snapshot')

const { runc8 } = require('./test-helpers')
const { expect } = require('chai')

require('chai')
  .use(chaiJestSnapshot)

const shouldCompressSnapShot = true
const isWin = (os.platform() === 'win32')
const OsStr = (isWin) ? 'windows' : 'unix'

describe(`Help Message - ${OsStr}`, function () {
  before(cb => rm('tmp', { recursive: true, force: true }, cb))
  /**
   *   Test: Ensure Help Message is Correct
   *   Command: c8 --help
   *
   *   Runs the hep option and compares to a snapshot
   */
  it('ensure the help message is correct', function () {
    chaiJestSnapshot.setTestName('ensure the help message is correct')
    chaiJestSnapshot.setFilename(`./test/help-message-${OsStr}.js.snap`)

    const opts = Object.freeze({
      stripWhiteSpace: shouldCompressSnapShot
    })
    const output = runc8('--help', opts)

    expect(output).to.matchSnapshot()
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

      const opts = Object.freeze({
        stripWhiteSpace: shouldCompressSnapShot
      })
      const output = runc8('', opts)

      expect(output).to.matchSnapshot()
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

      const opts = Object.freeze({
        stripWhiteSpace: shouldCompressSnapShot
      })
      const output = runc8('--print-config=false', opts)
      expect(output).to.matchSnapshot()
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

      const opts = Object.freeze({
        stripWhiteSpace: shouldCompressSnapShot,
        removeBannerDivider: true
      })

      const output = runc8('--print-config=true', opts)
      expect(output).to.matchSnapshot()
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

      const opts = Object.freeze({
        stripWhiteSpace: shouldCompressSnapShot,
        removeBannerDivider: true
      })

      const output = runc8('--print-config', opts)
      expect(output).to.matchSnapshot()
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
      const nodePath = process.execPath

      chaiJestSnapshot.setTestName('--print-config=false')
      chaiJestSnapshot.setFilename(`./test/help-message-${OsStr}.js.snap`)
      const args = [
        '--print-config=false',
        '--temp-directory=tmp/vanilla-all',
        '--clean=false',
        '--all=true',
        '--include=test/fixtures/all/vanilla/**/*.js',
        '--exclude=**/*.ts', // add an exclude to avoid default excludes of test/**
        nodePath,
        require.resolve('./fixtures/all/vanilla/main')
      ]

      const opts = Object.freeze({
        stripWhiteSpace: shouldCompressSnapShot
      })

      const output = runc8(args, opts)
      expect(output).to.matchSnapshot()
    })
  })
})
