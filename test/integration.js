/* global describe, before, beforeEach, it */

const { readFileSync } = require('fs')
const { resolve } = require('path')
const { spawnSync } = require('child_process')
const { statSync } = require('fs')
const { dirname } = require('path')
const c8Path = require.resolve('../bin/c8')
const nodePath = process.execPath
const tsNodePath = './node_modules/.bin/ts-node'
const chaiJestSnapshot = require('chai-jest-snapshot')
const rmrf = require('../lib/rmrf')

require('chai')
  .use(chaiJestSnapshot)
  .should()

before(cb => rmrf('tmp', cb))

const nodeMajorVersion = Number(process.version.slice(1).split('.')[0])
beforeEach(function () {
  // Node 10 is missing some of the patches to V8 that improve coverage in
  // newer Node.js versions, for this reason it requires its own snapshot file.
  if (nodeMajorVersion === 10) {
    const file = this.currentTest.file
    this.currentTest.file = `${file}_10`
  }
  chaiJestSnapshot.configureUsingMochaContext(this)
})

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

  it('should allow for files outside of cwd', () => {
    // Here we nest this test into the report directory making the multidir
    // directories outside of cwd. If the `--allowExternal` flag is not provided
    // the multidir files will now show up in the file report, even though they were
    // required in
    const { output, status } = spawnSync(nodePath, [
      c8Path,
      '--exclude="test/*.js"',
      '--temp-directory=tmp/allowExternal',
      '--clean=true',
      '--allowExternal',
      '--reporter=text',
      nodePath,
      require.resolve('./fixtures/report/allowExternal.js')
    ], {
      cwd: dirname(require.resolve('./fixtures/report/allowExternal.js'))
    })
    status.should.equal(0)
    output.toString('utf8').should.matchSnapshot()
  })

  it('should allow for multiple overrides of src location for --all', () => {
    // Here we nest this test into the report directory making the multidir
    // directories outside of cwd. Note, that the target srcOverride does not
    // require fiels from these directories but we want them initialized to 0
    // via --all. As such we --allowExternal and provide multiple --src patterns
    // to override cwd.
    const { output, status } = spawnSync(nodePath, [
      c8Path,
      '--exclude="test/*.js"',
      '--temp-directory=../tmp/src',
      '--clean=true',
      '--allowExternal',
      '--reporter=text',
      '--all',
      `--src=${dirname(require.resolve('./fixtures/multidir1/file1.js'))}`,
      `--src=${dirname(require.resolve('./fixtures/multidir2/file2.js'))}`,
      `--src=${dirname(require.resolve('./fixtures/report/srcOverride.js'))}`,
      nodePath,
      require.resolve('./fixtures/report/srcOverride.js')
    ], {
      cwd: dirname(require.resolve('./fixtures/report/srcOverride.js'))
    })
    status.should.equal(0)
    output.toString('utf8').should.matchSnapshot()
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
        '--exclude="test/fixtures/*.js"',
        '--temp-directory=tmp/check-coverage',
        '--lines=70',
        '--branches=56',
        '--statements=70'
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
        '--temp-directory=./tmp/report',
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
        '--temp-directory=./tmp/report',
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
      if (nodeMajorVersion === 10) return
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

    // see: https://github.com/bcoe/c8/issues/254
    it('does not incorrectly mark previous branch as uncovered (see #254)', () => {
      const { output } = spawnSync(nodePath, [
        c8Path,
        '--exclude="test/*.js"',
        '--temp-directory=tmp/issue-254',
        '--clean=true',
        '--reporter=text',
        nodePath,
        require.resolve('./fixtures/issue-254')
      ])
      output.toString('utf8').should.matchSnapshot()
    })
  })

  describe('source-maps', () => {
    beforeEach(cb => rmrf('tmp/source-map', cb))

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
    describe('rollup', () => {
      it('remaps branches', () => {
        const { output } = spawnSync(nodePath, [
          c8Path,
          '--exclude="test/*.js"',
          '--temp-directory=tmp/source-map',
          '--clean=true',
          nodePath,
          require.resolve('./fixtures/source-maps/branches/branches.rollup.js')
        ])
        output.toString('utf8').should.matchSnapshot()
      })

      it('remaps classes', () => {
        const { output } = spawnSync(nodePath, [
          c8Path,
          '--exclude="test/*.js"',
          '--temp-directory=tmp/source-map',
          '--clean=true',
          nodePath,
          require.resolve('./fixtures/source-maps/classes/classes.rollup.js')
        ])
        output.toString('utf8').should.matchSnapshot()
      })
    })
    describe('ts-node', () => {
      it('reads source-map from cache, and applies to coverage', () => {
        const { output } = spawnSync(nodePath, [
          c8Path,
          '--exclude="test/*.js"',
          '--temp-directory=tmp/source-map',
          '--clean=true',
          tsNodePath,
          require.resolve('./fixtures/ts-node-basic.ts')
        ])
        output.toString('utf8').should.matchSnapshot()
      })
    })
    // See: https://github.com/bcoe/c8/issues/232
    it("does not attempt to load source map URLs that aren't", () => {
      const { output } = spawnSync(nodePath, [
        c8Path,
        '--exclude="test/*.js"',
        '--temp-directory=tmp/source-map',
        '--clean=true',
        nodePath,
        require.resolve('./fixtures/source-maps/fake-source-map.js')
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
        tsNodePath,
        require.resolve('./fixtures/all/ts-only/main.ts')
      ])
      output.toString('utf8').should.matchSnapshot()
    })

    it('should allow for --all to be used in conjunction with --check-coverage', () => {
      const { output } = spawnSync(nodePath, [
        c8Path,
        '--temp-directory=tmp/all-check-coverage',
        '--clean=false',
        '--check-coverage',
        '--lines=100',
        '--all=true',
        '--include=test/fixtures/all/vanilla/**/*.js',
        '--exclude=**/*.ts', // add an exclude to avoid default excludes of test/**
        nodePath,
        require.resolve('./fixtures/all/vanilla/main')
      ])
      output.toString('utf8').should.matchSnapshot()
    })

    it('should allow for --all to be used with the check-coverage command (2 invocations)', () => {
      // generate v8 output
      spawnSync(nodePath, [
        c8Path,
        '--temp-directory=tmp/all-check-coverage-as-command',
        '--clean=false',
        '--check-coverage',
        '--lines=90',
        '--all=true',
        '--include=test/fixtures/all/vanilla/**/*.js',
        '--exclude=**/*.ts', // add an exclude to avoid default excludes of test/**
        nodePath,
        require.resolve('./fixtures/all/vanilla/main')
      ])

      // invoke check-coverage as a command with --all
      const { output } = spawnSync(nodePath, [
        c8Path,
        'check-coverage',
        '--lines=90',
        '--temp-directory=tmp/all-check-coverage-as-command',
        '--clean=false',
        '--all=true',
        '--include=test/fixtures/all/vanilla/**/*.js',
        '--exclude=**/*.ts' // add an exclude to avoid default excludes of test/**
      ])
      output.toString('utf8').should.matchSnapshot()
    })
  })
  // see: https://github.com/bcoe/c8/issues/149
  it('cobertura report escapes special characters', () => {
    spawnSync(nodePath, [
      c8Path,
      '--exclude="test/*.js"',
      '--temp-directory=tmp/cobertura',
      '--clean=false',
      '--reporter=cobertura',
      nodePath,
      require.resolve('./fixtures/computed-method')
    ])
    const cobertura = readFileSync(resolve(process.cwd(), './coverage/cobertura-coverage.xml'), 'utf8')
      .replace(/[0-9]{13,}/, 'nnnn')
      .replace(/<source>.*<\/source>/, '<source>/foo/file</source>')
      .replace(/\\/g, '/')
    cobertura.toString('utf8').should.matchSnapshot()
  })
  describe('report', () => {
    it('supports reporting on directories outside cwd', () => {
      // invoke a script that uses report as an api and supplies src dirs out
      // of cwd
      const { output } = spawnSync(nodePath, [
        require.resolve('./fixtures/report/report-multi-dir-external.js')
      ], {
        cwd: dirname(require.resolve('./fixtures/report/report-multi-dir-external.js'))
      })
      output.toString('utf8').should.matchSnapshot()
    })

    it('supports reporting on single directories outside cwd', () => {
      // invoke a script that uses report as an api and supplies src dirs out
      // of cwd.
      const { output } = spawnSync(nodePath, [
        require.resolve('./fixtures/report/report-single-dir-external.js')
      ], {
        cwd: dirname(require.resolve('./fixtures/report/report-single-dir-external.js'))
      })
      output.toString('utf8').should.matchSnapshot()
    })
  })

  it('collects coverage for script with shebang', () => {
    const { output } = spawnSync(nodePath, [
      c8Path,
      '--exclude="test/*.js"',
      '--temp-directory=tmp/shebang',
      '--clean=false',
      require.resolve('./fixtures/shebang')
    ])
    output.toString('utf8').should.matchSnapshot()
  })
})
