/* global describe, before, beforeEach, it */

const { readFileSync } = require('fs')
const { resolve } = require('path')
const { spawnSync } = require('child_process')
const { statSync, rm } = require('fs')
const { dirname } = require('path')
const c8Path = require.resolve('../bin/c8')
const nodePath = process.execPath
const tsNodePath = './node_modules/.bin/ts-node'
const chaiJestSnapshot = require('chai-jest-snapshot')

require('chai')
  .use(chaiJestSnapshot)
  .should()

before(cb => rm('tmp', { recursive: true, force: true }, cb))

beforeEach(function () {
  chaiJestSnapshot.configureUsingMochaContext(this)
})

;[false, true].forEach((mergeAsync) => {
  const title = mergeAsync ? 'c8 mergeAsync' : 'c8'
  describe(title, () => {
    it('reports coverage for script that exits normally', () => {
      const { output } = spawnSync(nodePath, [
        c8Path,
        '--exclude="test/*.js"',
        '--temp-directory=tmp/normal',
        '--clean=false',
        `--merge-async=${mergeAsync}`,
        nodePath,
        require.resolve('./fixtures/normal')
      ])
      output.toString('utf8').should.matchSnapshot()
    })

    it('supports externally set NODE_V8_COVERAGE', () => {
      const { output } = spawnSync(nodePath, [
        c8Path,
        '--exclude="test/*.js"',
        '--clean=true',
        `--merge-async=${mergeAsync}`,
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
        `--merge-async=${mergeAsync}`,
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
        `--merge-async=${mergeAsync}`,
        nodePath,
        require.resolve('./fixtures/multiple-spawn')
      ], {
        env: { NODE_DEBUG: 'c8' }
      })
      output.toString('utf8').should.match(
        /Error: ENOENT: no such file or directory.*loader\.js/
      )
    })

    it('exits with 1 when report output fails', () => {
      const { status, stderr } = spawnSync(nodePath, [
        c8Path,
        '--clean=false',
        '--reporter=unknown',
        `--merge-async=${mergeAsync}`,
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
        `--merge-async=${mergeAsync}`,
        nodePath,
        require.resolve('./fixtures/report/allowExternal.js')
      ], {
        cwd: dirname(require.resolve('./fixtures/report/allowExternal.js'))
      })
      status.should.equal(0)
      output.toString('utf8').should.matchSnapshot()
    })

    it('should allow for multiple include patterns', () => {
      // Here we nest this test into the report directory making the multidir
      // directories outside of cwd. Note, that the target srcOverride does not
      // require fields from these directories.
      const { output, status } = spawnSync(nodePath, [
        c8Path,
        '--exclude="test/*.js"',
        '--temp-directory=../tmp/src',
        '--clean=true',
        '--reporter=text',
        '--include="./test/fixtures/multidir1/*.js"',
        '--include="./test/fixtures/multidir2/*.js"',
        '--include="./test/fixtures/report/*.js"',
        `--merge-async=${mergeAsync}`,
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
        `--merge-async=${mergeAsync}`,
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
          '--branches=55',
          '--statements=70',
          `--merge-async=${mergeAsync}`
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
          '--lines=101',
          `--merge-async=${mergeAsync}`
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
          '--per-file',
          `--merge-async=${mergeAsync}`
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
          `--merge-async=${mergeAsync}`,
          nodePath,
          require.resolve('./fixtures/normal')
        ])
        status.should.equal(1)
        output.toString('utf8').should.matchSnapshot()
      })

      it('--100', () => {
        const { output, status } = spawnSync(nodePath, [
          c8Path,
          '--exclude="test/*.js"',
          '--temp-directory=tmp/check-coverage',
          '--100',
          `--merge-async=${mergeAsync}`,
          nodePath,
          require.resolve('./fixtures/normal')
        ])

        status.should.equal(1)
        output.toString('utf8').should.matchSnapshot()
      })

      it('check-coverage command with --100', () => {
        const { output, status } = spawnSync(nodePath, [
          c8Path,
          'check-coverage',
          '--exclude="test/*.js"',
          '--temp-directory=tmp/check-coverage',
          '--100',
          `--merge-async=${mergeAsync}`
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
          `--merge-async=${mergeAsync}`,
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
          '--clean=false',
          `--merge-async=${mergeAsync}`
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
          '--clean=false',
          `--merge-async=${mergeAsync}`
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
          `--merge-async=${mergeAsync}`,
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
          '--temp-directory=tmp/special-comment',
          `--merge-async=${mergeAsync}`,
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
          `--merge-async=${mergeAsync}`,
          nodePath,
          require.resolve('./fixtures/issue-254')
        ])
        output.toString('utf8').should.matchSnapshot()
      })
    })

    describe('/* c8 ignore start/stop */', () => {
      it('ignores lines with special comment', () => {
        const { output } = spawnSync(nodePath, [
          c8Path,
          '--exclude="test/*.js"',
          '--clean=false',
          '--temp-directory=tmp/start-stop',
          `--merge-async=${mergeAsync}`,
          nodePath,
          require.resolve('./fixtures/c8-ignore-start-stop.js')
        ])
        output.toString('utf8').should.matchSnapshot()
      })
    })

    describe('source-maps', () => {
      beforeEach(cb => rm('tmp/source-map', { recursive: true, force: true }, cb))

      describe('TypeScript', () => {
        // Bugs:
        //   closing '}' on `if` is not covered.
        it('remaps branches', () => {
          const { output } = spawnSync(nodePath, [
            c8Path,
            '--exclude="test/*.js"',
            '--temp-directory=tmp/source-map',
            '--clean=true',
            `--merge-async=${mergeAsync}`,
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
            `--merge-async=${mergeAsync}`,
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
            `--merge-async=${mergeAsync}`,
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
            `--merge-async=${mergeAsync}`,
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
            `--merge-async=${mergeAsync}`,
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
            `--merge-async=${mergeAsync}`,
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
            `--merge-async=${mergeAsync}`,
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
            `--merge-async=${mergeAsync}`,
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
            '--include="./test/fixtures/ts-node-basic.ts"',
            '--exclude="test/*.js"',
            '--temp-directory=tmp/source-map',
            '--clean=true',
            `--merge-async=${mergeAsync}`,
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
          `--merge-async=${mergeAsync}`,
          nodePath,
          require.resolve('./fixtures/source-maps/fake-source-map.js')
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
        '--clean=true',
        '--reporter=cobertura',
        `--merge-async=${mergeAsync}`,
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
        // invoke a script that uses report as an api and supplies include dirs out
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
        `--merge-async=${mergeAsync}`,
        require.resolve('./fixtures/shebang')
      ])
      output.toString('utf8').should.matchSnapshot()
    })

    describe('--exclude-after-remap', () => {
      it('applies exclude rules after source-maps are applied', () => {
        const { output } = spawnSync(nodePath, [
          c8Path,
          '--exclude="test/*.js"',
          '--exclude="**/branch-1.js"',
          '--exclude-after-remap',
          '--temp-directory=tmp/source-map',
          '--clean=true',
          `--merge-async=${mergeAsync}`,
          nodePath,
          require.resolve('./fixtures/source-maps/branches/branches.rollup.js')
        ])
        output.toString('utf8').should.matchSnapshot()
      })
    })

    describe('--extension', () => {
      it('includes coverage when extensions specified', () => {
        const { output } = spawnSync(nodePath, [
          c8Path,
          '--exclude="test/*.js"',
          '--extension=.js',
          '--extension=.special',
          '--temp-directory=tmp/extension',
          '--clean=true',
          `--merge-async=${mergeAsync}`,
          nodePath,
          require.resolve('./fixtures/custom-ext.special')
        ])
        output.toString('utf8').should.matchSnapshot()
      })
    })

    describe('monocart report', () => {
      it('check import monocart', async () => {
        const { output, status } = spawnSync(nodePath, ['./test/fixtures/import-mcr.js'])
        status.should.equal(1)
        output.toString('utf8').should.matchSnapshot()
      })

      it('monocart check normal', () => {
        const { output } = spawnSync(nodePath, [
          c8Path,
          '--experimental-monocart',
          '--exclude="test/*.js"',
          '--temp-directory=tmp/monocart-normal',
          '--reports-dir=tmp/monocart-normal-reports',
          '--reporter=v8',
          '--reporter=console-details',
          '--clean=false',
          `--merge-async=${mergeAsync}`,
          nodePath,
          require.resolve('./fixtures/normal')
        ])
        output.toString('utf8').should.matchSnapshot()
      })

      it('monocart check coverage', () => {
        const { output, status } = spawnSync(nodePath, [
          c8Path,
          '--experimental-monocart',
          '--exclude="test/*.js"',
          '--temp-directory=tmp/monocart-check-coverage',
          '--reports-dir=tmp/monocart-check-coverage-reports',
          '--reporter=v8',
          '--reporter=console-details',
          '--check-coverage',
          '--statements=80',
          '--branches=80',
          '--lines=80',
          '--clean=false',
          `--merge-async=${mergeAsync}`,
          nodePath,
          require.resolve('./fixtures/normal')
        ])
        status.should.equal(1)
        output.toString('utf8').should.matchSnapshot()
      })

      it('monocart check coverage pre file', () => {
        const { output, status } = spawnSync(nodePath, [
          c8Path,
          '--experimental-monocart',
          '--exclude="test/*.js"',
          '--temp-directory=tmp/monocart-check-per-file',
          '--reports-dir=tmp/monocart-check-per-file-reports',
          '--reporter=v8',
          '--reporter=console-details',
          '--check-coverage',
          '--statements=80',
          '--branches=80',
          '--lines=80',
          '--per-file',
          '--clean=false',
          `--merge-async=${mergeAsync}`,
          nodePath,
          require.resolve('./fixtures/normal')
        ])
        status.should.equal(1)
        output.toString('utf8').should.matchSnapshot()
      })

      it('check sourcemap', () => {
        const { output } = spawnSync(nodePath, [
          c8Path,
          '--experimental-monocart',
          '--exclude="test/*.js"',
          '--temp-directory=tmp/monocart-source-map',
          '--reports-dir=tmp/monocart-source-map-reports',
          '--reporter=v8',
          '--reporter=text',
          '--exclude-after-remap',
          '--clean=false',
          `--merge-async=${mergeAsync}`,
          nodePath,
          require.resolve('./fixtures/source-maps/branches/branches.typescript.js')
        ])
        output.toString('utf8').should.matchSnapshot()
      })
    })
  })
})
