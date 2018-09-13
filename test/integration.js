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
      '--clean=false',
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
      '--clean=false',
      nodePath,
      require.resolve('./fixtures/multiple-spawn')
    ])
    output.toString('utf8').should.include(`
--------------------|----------|----------|----------|----------|-------------------|
File                |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
--------------------|----------|----------|----------|----------|-------------------|
All files           |    94.12 |    70.59 |        0 |    94.12 |                   |
 bin                |    83.72 |    57.14 |      100 |    83.72 |                   |
  c8.js             |    83.72 |    57.14 |      100 |    83.72 |... 22,40,41,42,43 |
 lib                |    96.41 |    65.38 |      100 |    96.41 |                   |
  parse-args.js     |    97.47 |    44.44 |      100 |    97.47 |             55,56 |
  report.js         |    95.45 |    76.47 |      100 |    95.45 |       51,52,53,54 |
 test/fixtures      |    95.16 |    83.33 |        0 |    95.16 |                   |
  async.js          |      100 |      100 |      100 |      100 |                   |
  multiple-spawn.js |      100 |      100 |      100 |      100 |                   |
  normal.js         |    85.71 |       75 |        0 |    85.71 |          14,15,16 |
  subprocess.js     |      100 |    71.43 |      100 |      100 |              9,13 |
--------------------|----------|----------|----------|----------|-------------------|`)
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
