/* eslint-env mocha */

'use strict'

const assert = require('assert').strict
const { readFileSync } = require('fs')
const getSourceMapFromFile = require('../lib/source-map-from-file')

describe('source-map-from-file', () => {
  it('should parse source maps from compiled targets', () => {
    const sourceMap = getSourceMapFromFile('./test/fixtures/all/ts-compiled/main.js')
    const expected = JSON.parse(readFileSync(require.resolve('./fixtures/all/ts-compiled/main.js.map'), 'utf8'))
    assert.deepEqual(sourceMap, expected)
  })
  it('should handle extra whitespace characters', () => {
    const sourceMap = getSourceMapFromFile('./test/fixtures/source-maps/padded.js')
    assert.deepEqual(sourceMap, { version: 3 })
  })
  it('should support base64 encoded inline source maps', () => {
    const sourceMap = getSourceMapFromFile('./test/fixtures/source-maps/inline.js')
    assert.equal(sourceMap.version, 3)
  })
})
