import test from 'ava'
import spawn from 'await-spawn'

const nodePath = process.execPath
const c8Path = require.resolve('../bin/c8')

test('exits with 0 if coverage within threshold', async t => {
  const output = await spawn(nodePath, [
    c8Path,
    'check-coverage',
    '--exclude="test/*.js"',
    '--lines=70'
  ])

  t.snapshot(output.toString('utf8'))
})

test('allows threshold to be applied on a per-file basis', t => {
  return spawn(nodePath, [
    c8Path,
    'check-coverage',
    '--exclude="test/*.js"',
    '--lines=80',
    '--per-file'
  ]).catch(({ code, stderr }) => {
    t.is(code, 1)
    t.snapshot(stderr.toString('utf8'))
  })
})

test('exits with 1 if coverage is below threshold', t => {
  return spawn(nodePath, [
    c8Path,
    'check-coverage',
    '--exclude="test/*.js"',
    '--lines=101'
  ]).catch(({ code, stderr }) => {
    t.is(code, 1)
    t.snapshot(stderr.toString('utf8'))
  })
})

test('allows --check-coverage when executing script', t => {
  return spawn(nodePath, [
    c8Path,
    '--exclude="test/*.js"',
    '--clean=false',
    '--lines=101',
    '--check-coverage',
    nodePath,
    require.resolve('./fixtures/normal')
  ]).catch(({ code, stderr }) => {
    t.is(code, 1)
    t.snapshot(stderr.toString('utf8'))
  })
})
