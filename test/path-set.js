/* global describe, it */
const PathSet = require('../lib/path-set')
const assert = require('assert')
describe('path-set', () => {
  it('should have only one entry when adding strings with different cases on win32', () => {
    const pathSet = new PathSet()
    pathSet._win32 = true
    const file = 'foo.js'
    pathSet.add(file)
    pathSet.add(file.toUpperCase())
    assert.strictEqual(pathSet.size, 1)
  })

  it('should have multiple entries when adding strings with different cases on non-win32', () => {
    const pathSet = new PathSet()
    pathSet._win32 = false
    const file = 'foo.js'
    pathSet.add(file)
    pathSet.add(file.toUpperCase())
    assert.strictEqual(pathSet.size, 2)
  })

  it('has should return true for different cases on win32', () => {
    const pathSet = new PathSet()
    pathSet._win32 = true
    const file = 'foo.js'
    pathSet.add(file)
    assert(pathSet.has(file.toUpperCase()))
  })

  it('has should NOT return true for different cases non-win32', () => {
    const pathSet = new PathSet()
    pathSet._win32 = false
    const file = 'foo.js'
    pathSet.add(file)
    assert(!pathSet.has(file.toUpperCase()))
  })
})
