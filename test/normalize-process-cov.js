/* global describe, it */

const { pathToFileURL } = require('url')
const { resolve } = require('path')
const createReport = require('../lib/report')

require('chai').should()

describe('_normalizeProcessCov', () => {
  it('should not add files that fail shouldInstrument to fileIndex', () => {
    const report = createReport({
      include: ['test/fixtures/all/filtered/src/**/*.js'],
      exclude: [],
      tempDirectory: 'tmp/filtered',
      reportsDirectory: 'coverage/filtered',
      reporter: ['text']
    })

    const includedFile = resolve('test/fixtures/all/filtered/src/loaded.js')
    const excludedFile = resolve('test/fixtures/all/filtered/lib/excluded.js')
    const entryFile = resolve('test/fixtures/all/filtered/main.js')

    const fakeV8ProcessCov = {
      result: [
        {
          scriptId: '1',
          url: pathToFileURL(includedFile).href,
          functions: [{
            functionName: '',
            ranges: [{ startOffset: 0, endOffset: 100, count: 1 }],
            isBlockCoverage: true
          }]
        },
        {
          scriptId: '2',
          url: pathToFileURL(excludedFile).href,
          functions: [{
            functionName: '',
            ranges: [{ startOffset: 0, endOffset: 50, count: 1 }],
            isBlockCoverage: true
          }]
        },
        {
          scriptId: '3',
          url: pathToFileURL(entryFile).href,
          functions: [{
            functionName: '',
            ranges: [{ startOffset: 0, endOffset: 80, count: 1 }],
            isBlockCoverage: true
          }]
        }
      ]
    }

    const fileIndex = new Set()
    const normalized = report._normalizeProcessCov(fakeV8ProcessCov, fileIndex)

    // Only the file matching the include pattern should be in the result
    normalized.result.should.have.lengthOf(1)
    normalized.result[0].url.should.equal(includedFile)

    // fileIndex should only contain files that passed shouldInstrument
    fileIndex.has(includedFile).should.equal(true)
    fileIndex.has(excludedFile).should.equal(false)
    fileIndex.has(entryFile).should.equal(false)
  })
})
