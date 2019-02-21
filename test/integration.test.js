import test from 'ava'
import spawn from 'await-spawn'

const nodePath = process.execPath
const c8Path = require.resolve('../bin/c8')

test('reports coverage for script that exits normally', async t => {
  const output = await spawn(nodePath, [
    c8Path,
    '--exclude="test/*.js"',
    '--clean=false',
    nodePath,
    require.resolve('./fixtures/normal')
  ])

  t.snapshot(output.toString('utf8'))
})

test('merges reports from suprocess together', async t => {
  const output = await spawn(nodePath, [
    c8Path,
    '--exclude="test/*.js"',
    '--clean=false',
    nodePath,
    require.resolve('./fixtures/multiple-spawn')
  ])

  t.snapshot(output.toString('utf8'))
})

test.failing('allows relative files to be included', async t => {
  const output = await spawn(nodePath, [
    c8Path,
    '--exclude="test/*.js"',
    '--omit-relative=false',
    '--clean=false',
    nodePath,
    require.resolve('./fixtures/multiple-spawn')
  ])

  t.regex(
    output.toString('utf8'),
    /Error: ENOENT: no such file or directory.*loaders\.js/
  )
})
