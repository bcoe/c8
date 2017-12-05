/* global describe, it */

const parseArgs = require('../lib/parse-args')

describe('parse-args', () => {
  it('outputs some coverage information', () => {
    parseArgs.hideInstrumenteeArgs()
  })
})
