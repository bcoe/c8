/* global describe, before, beforeEach, it */

const { runSpawn } = require('./print-config-helpers')
const c8Path = require.resolve('../bin/c8')
const { rm } = require('fs')
const nodePath = process.execPath

const chaiJestSnapshot = require('chai-jest-snapshot')
require('chai').should()
require('chai')
  .use(chaiJestSnapshot)
  .should()

const helpMessageUnitTest = () => {
  before(cb => rm('tmp', { recursive: true, force: true }, cb))

  beforeEach(function () {
    chaiJestSnapshot.configureUsingMochaContext(this)
  })

  describe('Help Message', () => {
    // Ensure the help message is correct - Snapshot of help message
    /**
     *   Test: Ensure Help Message is Correct
     *   Command: c8 --help
     *
     *   Runs the hep option and compares to a snapshot
     */
    it('ensure the help message is correct', () => {
      const output = runSpawn([c8Path, '--help'], true, true)

      output.should.matchSnapshot()
    })

    /**
     *  Test: Ensure 'not enough non-option arguments' warning message
     *  Command: c8
     *
     *  Runs c8 with incorrect options to make sure it produces a warning
     *
     */
    it('ensure \'not enough non-option arguments\' warning message', () => {
      const output = runSpawn([c8Path], true, true)

      output.should.matchSnapshot()
    })

    /**
     *
     *  Test: should not demand any arguments: --print-config=true
     *  Command: c8 --print-config=true
     *
     *  if print-config is true, c8 shouldn't demand any arguments
     *
     */
    it('should not demand any arguments: --print-config=true', () => {
      const out = runSpawn([c8Path, '--print-config=true'], true, true)
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
    it('should not demand any arguments: --print-config', () => {
      const out = runSpawn([c8Path, '--print-config'], true, true)
      out.should.matchSnapshot()
    })

    /**
     *
     *  Test: should demand arguments: --print-config=false
     *  Command: c8 --print-config=false
     *
     */
    it('should demand arguments: --print-config=false', () => {
      // Run Command./bin/c8.js --print-config=false
      const out = runSpawn([c8Path, '--print-config=false'], true, true)
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
    it('should not demand arguments: --print-config=false', () => {
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
      const out = runSpawn(args, true, true)
      out.should.matchSnapshot()
    })
  })
}

module.exports = { helpMessageUnitTest }
