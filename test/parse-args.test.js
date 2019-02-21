import test from 'ava'
import {
  buildYargs,
  hideInstrumenteeArgs,
  hideInstrumenterArgs
} from '../lib/parse-args'

test('hideInstrumentee args hides arguments passed to instrumented app', t => {
  process.argv = ['node', 'c8', '--foo=99', 'my-app', '--help']

  const instrumenterArgs = hideInstrumenteeArgs()

  t.deepEqual(instrumenterArgs, ['--foo=99', 'my-app'])
})

test('hideInstrumenterArgs hides arguments passed to c8 bin', t => {
  process.argv = ['node', 'c8', '--foo=99', 'my-app', '--help']
  const argv = buildYargs().parse(hideInstrumenteeArgs())

  const instrumenteeArgs = hideInstrumenterArgs(argv)

  t.deepEqual(instrumenteeArgs, ['my-app', '--help'])
})
