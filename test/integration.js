/* global describe, beforeEach, it */

const { spawnSync } = require('child_process')
const c8Path = require.resolve('../bin/c8')
const nodePath = process.execPath
const chaiJestSnapshot = require('chai-jest-snapshot')

require('chai')
  .use(chaiJestSnapshot)
  .should()

beforeEach(function () { chaiJestSnapshot.configureUsingMochaContext(this) })

describe('c8', () => {
  it('reports coverage for script that exits normally', () => {
    const { output } = spawnSync(nodePath, [
      c8Path,
      '--exclude="test/*.js"',
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
      '--clean=false',
      nodePath,
      require.resolve('./fixtures/multiple-spawn')
    ])
    output.toString('utf8').should.matchSnapshot()
  })

  it('omit-relative can be set to false', () => {
    const { output } = spawnSync(nodePath, [
      c8Path,
      '--exclude="test/*.js"',
      '--omit-relative=false',
      '--clean=false',
      nodePath,
      require.resolve('./fixtures/multiple-spawn')
    ])
    output.toString('utf8').should.match(
      /Error: ENOENT: no such file or directory.*loaders\.js/
    )
  })
})
