/**
 * A unique set of paths. Case insensitive on win32
 */
class PathSet extends Set {
  constructor () {
    super()
    this._win32 = process.platform === 'win32'
  }

  add (value) {
    if (this._win32) {
      value = value.toLowerCase()
    }
    super.add(value)
    return this
  }

  has (value) {
    if (this._win32) {
      value = value.toLowerCase()
    }
    return super.has(value)
  }
}

module.exports = PathSet
