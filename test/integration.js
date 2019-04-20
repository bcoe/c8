/* global describe, before, beforeEach, it */

const { spawnSync } = require('child_process')
const c8Path = require.resolve('../bin/c8')
const nodePath = process.execPath
const chaiJestSnapshot = require('chai-jest-snapshot')
const rimraf = require('rimraf')

require('chai')
  .use(chaiJestSnapshot)
  .should()

before(cb => rimraf('tmp', cb))
beforeEach(function () { chaiJestSnapshot.configureUsingMochaContext(this) })

describe('c8', () => {
  it('reports coverage for script that exits normally', () => {
    const { output } = spawnSync(nodePath, [
      c8Path,
      '--exclude="test/*.js"',
      '--temp-directory=tmp/normal',
      '--clean=false',
      nodePath,
      require.resolve('./fixtures/normal')
    ])
    output.toString('utf8').should.matchSnapshot()
  })

  it('merges reports from subprocesses together', () => {
    const { output } = spawnSync(nodePath, [
      c8Path,
      '--exclude="test/*.js"',
      '--temp-directory=tmp/multiple-spawn',
      '--clean=false',
      nodePath,
      require.resolve('./fixtures/multiple-spawn')
    ])
    output.toString('utf8').should.matchSnapshot()
  })

  it('allows relative files to be included', () => {
    const { output } = spawnSync(nodePath, [
      c8Path,
      '--exclude="test/*.js"',
      '--temp-directory=tmp/multiple-spawn-2',
      '--omit-relative=false',
      '--clean=false',
      nodePath,
      require.resolve('./fixtures/multiple-spawn')
    ])
    output.toString('utf8').should.match(
      /Error: ENOENT: no such file or directory.*loaders\.js/
    )
  })

  describe('check-coverage', () => {
    before(() => {
      spawnSync(nodePath, [
        c8Path,
        '--exclude="test/*.js"',
        '--temp-directory=tmp/check-coverage',
        '--clean=false',
        nodePath,
        require.resolve('./fixtures/normal')
      ])
    })

    it('exits with 0 if coverage within threshold', () => {
      const { output, status } = spawnSync(nodePath, [
        c8Path,
        'check-coverage',
        '--exclude="test/*.js"',
        '--temp-directory=tmp/check-coverage',
        '--lines=80'
      ])
      status.should.equal(0)
      output.toString('utf8').should.matchSnapshot()
    })

    it('exits with 1 if coverage is below threshold', () => {
      const { output, status } = spawnSync(nodePath, [
        c8Path,
        'check-coverage',
        '--exclude="test/*.js"',
        '--temp-directory=tmp/check-coverage',
        '--lines=101'
      ])
      status.should.equal(1)
      output.toString('utf8').should.matchSnapshot()
    })

    it('allows threshold to be applied on per-file basis', () => {
      const { output, status } = spawnSync(nodePath, [
        c8Path,
        'check-coverage',
        '--exclude="test/*.js"',
        '--temp-directory=tmp/check-coverage',
        '--lines=101',
        '--per-file'
      ])
      status.should.equal(1)
      output.toString('utf8').should.matchSnapshot()
    })

    it('allows --check-coverage when executing script', () => {
      const { output, status } = spawnSync(nodePath, [
        c8Path,
        '--exclude="test/*.js"',
        '--clean=false',
        '--temp-directory=tmp/check-coverage',
        '--lines=101',
        '--check-coverage',
        nodePath,
        require.resolve('./fixtures/normal')
      ])
      status.should.equal(1)
      output.toString('utf8').should.matchSnapshot()
    })
  })

  describe('report', () => {
    before(() => {
      spawnSync(nodePath, [
        c8Path,
        '--exclude="test/*.js"',
        '--temp-directory=tmp/report',
        '--clean=false',
        nodePath,
        require.resolve('./fixtures/normal')
      ])
    })

    it('generates report from existing temporary files', () => {
      const { output } = spawnSync(nodePath, [
        c8Path,
        'report',
        '--exclude="test/*.js"',
        '--temp-directory=tmp/report',
        '--clean=false'
      ])
      output.toString('utf8').should.matchSnapshot()
    })

    it('supports --check-coverage, when generating reports', () => {
      const { output, status } = spawnSync(nodePath, [
        c8Path,
        'report',
        '--check-coverage',
        '--lines=101',
        '--exclude="test/*.js"',
        '--temp-directory=tmp/report',
        '--clean=false'
      ])
      status.should.equal(1)
      output.toString('utf8').should.matchSnapshot()
    })
  })

  describe('ESM Modules', () => {
    it('collects coverage for ESM modules', () => {
      const { output } = spawnSync(nodePath, [
        c8Path,
        '--exclude="test/*.js"',
        '--clean=false',
        '--temp-directory=tmp/esm',
        nodePath,
        '--experimental-modules',
        '--no-warnings',
        require.resolve('./fixtures/import.mjs')
      ])
      output.toString('utf8').should.matchSnapshot()
    })
  })
})
