/* global describe, it */
const getSourceMapFromFile = require('../lib/source-map-from-file')
const assert = require('assert')
const path = require('path')
describe('source-map-from-file', () => {
  it('should parse source maps from compiled targets', () => {
    const sourceMap = getSourceMapFromFile('./test/fixtures/all/ts-compiled/main.js')
    assert.strictEqual(sourceMap, ['test', 'fixtures', 'all', 'ts-compiled', 'main.js.map'].join(path.sep))
  })
  it('should handle extra whitespace characters', () => {
    const sourceMap = getSourceMapFromFile('./test/fixtures/source-maps/padded.js')
    assert.strictEqual(sourceMap, ['test', 'fixtures', 'source-maps', 'padded.js.map'].join(path.sep))
  })
})
