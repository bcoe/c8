/* global describe, it */
const { getSourceMapFromFile, sourceMapFromDataUrl } = require('../lib/source-map-from-file')
const assert = require('assert')
const { readFileSync } = require('fs')
const chia = require('chai')
const spies = require('chai-spies')

chia.use(spies)

const { expect } = chia

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

  it('should throw error if source map isn\'t JSON format', () => {
    const spy = chia.spy
    spy.on(JSON, 'parse', (content) => {
      throw new Error('No actual error. Just testing code coverage.  ')
    })
    try {
      getSourceMapFromFile('./test/fixtures/all/ts-compiled/main.js')
    } finally {
      expect(JSON.parse).to.have.been.called()
      spy.restore()
    }

    spy.on(JSON, 'parse', (content) => {
      throw new Error('No actual error. Just testing code coverage.  ')
    })
    try {
      const mockUrl = 'application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb...'
      const sourceMap = sourceMapFromDataUrl(mockUrl)
      expect(sourceMap).to.equal(null)
    } finally {
      expect(JSON.parse).to.have.been.called()
      spy.restore()
    }
  })

  it('should throw error if url doesn\'t have a json content type', () => {
    const mockUrl = 'application/text;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb...'
    const sourceMap = sourceMapFromDataUrl(mockUrl)
    expect(sourceMap).to.equal(null)
  })
})
