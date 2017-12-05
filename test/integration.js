/* global describe, it */

const {spawnSync} = require('child_process')
const c8Path = require.resolve('../bin/c8')

describe('c8', () => {
  it('reports coverage for script that exits normally', () => {
    // won't work until we figure out the spawn-wrap flow.
    spawnSync(c8Path, [
      process.execPath,
      require.resolve('./fixtures/a')
    ], {
      env: process.env,
      cwd: process.cwd()
    })
  })
})
