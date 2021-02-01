/* global describe, it */
const getSourceMapFromFile = require('../lib/source-map-from-file')
const assert = require('assert')
const { readFileSync } = require('fs')
describe('source-map-from-file', () => {
  it('should parse source maps from compiled targets', () => {
    const sourceMap = getSourceMapFromFile('./test/fixtures/all/ts-compiled/main.js')
    const expected = JSON.parse(readFileSync(require.resolve('./fixtures/all/ts-compiled/main.js.map'), 'utf8'))
    assert.deepStrictEqual(sourceMap, expected)
  })
  it('should handle extra whitespace characters', () => {
    const sourceMap = getSourceMapFromFile('./test/fixtures/source-maps/padded.js')
    assert.deepStrictEqual(sourceMap, { version: 3 })
  })
  it('should support base64 encoded inline source maps', () => {
    const sourceMap = getSourceMapFromFile('./test/fixtures/source-maps/inline.js')
    assert.strictEqual(sourceMap.version, 3)
  })
})
