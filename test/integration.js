/* global describe, it */

const { spawnSync } = require('child_process')
const c8Path = require.resolve('../bin/c8')
const nodePath = process.execPath

require('chai').should()

describe('c8', () => {
  it('reports coverage for script that exits normally', () => {
    const { output } = spawnSync(nodePath, [
      c8Path,
      '--exclude="test/*.js"',
      nodePath,
      require.resolve('./fixtures/normal')
    ])
    output.toString('utf8').should.include(`
-----------|----------|----------|----------|----------|-------------------|
File       |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------|----------|----------|----------|----------|-------------------|
All files  |    91.18 |    88.89 |        0 |    91.18 |                   |
 async.js  |      100 |      100 |      100 |      100 |                   |
 normal.js |    85.71 |       75 |        0 |    85.71 |          14,15,16 |
-----------|----------|----------|----------|----------|-------------------|`)
  })

  it('merges reports from subprocesses together', () => {
    const { output } = spawnSync(nodePath, [
      c8Path,
      '--exclude="test/*.js"',
      nodePath,
      require.resolve('./fixtures/multiple-spawn')
    ])
    output.toString('utf8').should.include(`
-------------------|----------|----------|----------|----------|-------------------|
File               |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-------------------|----------|----------|----------|----------|-------------------|
All files          |      100 |    77.78 |      100 |      100 |                   |
 multiple-spawn.js |      100 |      100 |      100 |      100 |                   |
 subprocess.js     |      100 |    71.43 |      100 |      100 |              9,13 |
-------------------|----------|----------|----------|----------|-------------------|`)
  })

  it('omit-relative can be set to false', () => {
    const { output } = spawnSync(nodePath, [
      c8Path,
      '--exclude="test/*.js"',
      '--omit-relative=false',
      nodePath,
      require.resolve('./fixtures/multiple-spawn')
    ])
    output.toString('utf8').should.match(
      /Error: ENOENT: no such file or directory.*loaders\.js/
    )
  })
})
