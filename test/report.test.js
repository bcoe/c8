import test from 'ava'
import spawn from 'await-spawn'

const nodePath = process.execPath
const c8Path = require.resolve('../bin/c8')

test('generates report from existing temporary files', async t => {
  const output = await spawn(nodePath, [
    c8Path,
    'report',
    '--exclude="test/*.js"',
    '--clean=false'
  ])

  t.snapshot(output.toString('utf8'))
})

test('supports --check-coverage when generating reports', t => {
  return spawn(nodePath, [
    c8Path,
    'report',
    '--check-coverage',
    '--lines=101',
    '--exclude="test/*.js"',
    '--clean=false'
  ]).catch(({ code, stderr }) => {
    t.is(code, 1)
    t.snapshot(stderr.toString('utf8'))
  })
})
