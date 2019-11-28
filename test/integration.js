/* global describe, before, beforeEach, it */

const { spawnSync } = require('child_process')
const { statSync } = require('fs')
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

  it('supports exeternally set NODE_V8_COVERAGE', () => {
    const { output } = spawnSync(nodePath, [
      c8Path,
      '--exclude="test/*.js"',
      '--clean=false',
      nodePath,
      require.resolve('./fixtures/normal')
    ], {
      env: {
        NODE_V8_COVERAGE: 'tmp/override'
      }
    })
    const stats = statSync('tmp/override')
    stats.isDirectory().should.equal(true)
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

  it('exits with 1 when report output fails', () => {
    const { status, stderr } = spawnSync(nodePath, [
      c8Path,
      '--clean=false',
      '--reporter=unknown',
      nodePath,
      '--version'
    ])
    status.should.equal(1)
    stderr.toString().should.match(/Cannot find module 'unknown'/u)
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

  describe('/* c8 ignore next */', () => {
    it('ignores lines with special comment', () => {
      const { output } = spawnSync(nodePath, [
        c8Path,
        '--exclude="test/*.js"',
        '--clean=false',
        '--temp-directory=tmp/normal',
        nodePath,
        require.resolve('./fixtures/c8-ignore-next.js')
      ])
      output.toString('utf8').should.matchSnapshot()
    })
  })

  describe('source-maps', () => {
    beforeEach(cb => rimraf('tmp/source-map', cb))

    describe('TypeScript', () => {
      // Bugs:
      //   closing '}' on `if` is not covered.
      it('remaps branches', () => {
        const { output } = spawnSync(nodePath, [
          c8Path,
          '--exclude="test/*.js"',
          '--temp-directory=tmp/source-map',
          '--clean=true',
          nodePath,
          require.resolve('./fixtures/source-maps/branches/branches.typescript.js')
        ])
        output.toString('utf8').should.matchSnapshot()
      })

      // Bugs:
      //   closing '}' on `if` is not covered.
      it('remaps classes', () => {
        const { output } = spawnSync(nodePath, [
          c8Path,
          '--exclude="test/*.js"',
          '--temp-directory=tmp/source-map',
          '--clean=true',
          nodePath,
          require.resolve('./fixtures/source-maps/classes/classes.typescript.js')
        ])
        output.toString('utf8').should.matchSnapshot()
      })
    })

    describe('UglifyJS', () => {
      // Bugs:
      //   string in `console.info` shown as uncovered branch.
      it('remaps branches', () => {
        const { output } = spawnSync(nodePath, [
          c8Path,
          '--exclude="test/*.js"',
          '--temp-directory=tmp/source-map',
          '--clean=true',
          nodePath,
          require.resolve('./fixtures/source-maps/branches/branches.uglify.js')
        ])
        output.toString('utf8').should.matchSnapshot()
      })

      // Bugs:
      //   string in `console.info` shown as uncovered branch.
      it('remaps classes', () => {
        const { output } = spawnSync(nodePath, [
          c8Path,
          '--exclude="test/*.js"',
          '--temp-directory=tmp/source-map',
          '--clean=true',
          nodePath,
          require.resolve('./fixtures/source-maps/classes/classes.uglify.js')
        ])
        output.toString('utf8').should.matchSnapshot()
      })
    })

    describe('nyc', () => {
      // Bugs:
      //  first 'if' statement indicates two odd missing branches.
      //  line 4 should be covered.
      it('remaps branches', () => {
        const { output } = spawnSync(nodePath, [
          c8Path,
          '--exclude="test/*.js"',
          '--temp-directory=tmp/source-map',
          '--clean=true',
          nodePath,
          require.resolve('./fixtures/source-maps/branches/branches.nyc.js')
        ])
        output.toString('utf8').should.matchSnapshot()
      })

      // Bugs:
      //  the portion `class F` of `class Foo` indicates missing branch.
      //  line 6 should be covered.
      it('remaps classes', () => {
        const { output } = spawnSync(nodePath, [
          c8Path,
          '--exclude="test/*.js"',
          '--temp-directory=tmp/source-map',
          '--clean=true',
          nodePath,
          require.resolve('./fixtures/source-maps/classes/classes.nyc.js')
        ])
        output.toString('utf8').should.matchSnapshot()
      })
    })
  })

  describe('ts-node', () => {
    beforeEach(cb => rimraf('tmp/source-map', cb))

    it('reads source-map from cache, and applies to coverage', () => {
      const { output } = spawnSync(nodePath, [
        c8Path,
        '--exclude="test/*.js"',
        '--temp-directory=tmp/source-map',
        '--clean=true',
        './node_modules/.bin/ts-node',
        require.resolve('./fixtures/ts-node-basic.ts')
      ])
      output.toString('utf8').should.matchSnapshot()
    })
  })
  describe('--all', () => {
    it('reports coverage for unloaded js files as 0 for line, branch and function', () => {
      const { output } = spawnSync(nodePath, [
        c8Path,
        '--temp-directory=tmp/vanilla-all',
        '--clean=false',
        '--all=true',
        '--include=test/fixtures/all/vanilla/**/*.js',
        '--exclude=**/*.ts', // add an exclude to avoid default excludes of test/**
        nodePath,
        require.resolve('./fixtures/all/vanilla/main')
      ])
      output.toString('utf8').should.matchSnapshot()
    })

    it('reports coverage for unloaded transpiled ts files as 0 for line, branch and function', () => {
      const { output } = spawnSync(nodePath, [
        c8Path,
        '--temp-directory=tmp/all-ts',
        '--clean=false',
        '--all=true',
        '--include=test/fixtures/all/ts-compiled/**/*.js',
        '--exclude="test/*.js"', // add an exclude to avoid default excludes of test/**
        nodePath,
        require.resolve('./fixtures/all/ts-compiled/main.js')
      ])
      output.toString('utf8').should.matchSnapshot()
    })

    it('reports coverage for unloaded ts files as 0 for line, branch and function when using ts-node', () => {
      const { output } = spawnSync(nodePath, [
        c8Path,
        '--temp-directory=tmp/all-ts-node',
        '--clean=false',
        '--all=true',
        '--include=test/fixtures/all/ts-only/**/*.ts',
        '--exclude="test/*.js"', // add an exclude to avoid default excludes of test/**
        './node_modules/.bin/ts-node',
        require.resolve('./fixtures/all/ts-only/main.ts')
      ])
      output.toString('utf8').should.matchSnapshot()
    })
  })
})
