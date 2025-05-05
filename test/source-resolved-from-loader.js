/* global describe, before, beforeEach, it */

const { spawnSync } = require('child_process')
const c8Path = require.resolve('../bin/c8')
const nodePath = process.execPath
const tsNodePath = './node_modules/.bin/ts-node'
const chaiJestSnapshot = require('chai-jest-snapshot')
const rimraf = require('rimraf')
const nodemodule = require('node:module')

require('chai')
  .use(chaiJestSnapshot)
  .should()

before(cb => rimraf('tmp', cb))

beforeEach(function () {
  chaiJestSnapshot.configureUsingMochaContext(this)
})

;[false, true].forEach((mergeAsync) => {
  const title = mergeAsync ? 'c8+loader mergeAsync' : 'c8+loader'
  describe(title, () => {
    if (nodemodule.register) {
      it('reports coverage for query-loaded js files, with accuracy', async () => {
        const { output } = spawnSync(nodePath, [
          c8Path,
          '--temp-directory=tmp/vanilla-all',
          '--clean=false',
          '--all=true',
          '--include=test/fixtures/all/vanilla/**/*.js',
          '--exclude=**/*.ts', // add an exclude to avoid default excludes of test/**
          `--merge-async=${mergeAsync}`,
          nodePath,
          '--experimental-default-type=module',
          require.resolve('./fixtures/all/vanilla/main.querystring-import.mjs')
        ])

        // test fails if loaded row looks like this
        //  loaded.js   |     100 |      100 |     100 |     100 | 
        output.toString('utf8')
          .split('\n')
          .filter(l => l.includes(' loaded.js'))[0]
          .split('|').filter(l => /\d/.test(l))
          .every(l => !l.includes(100))
          .should.equal(true)
      })
    }
  })
})
