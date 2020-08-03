module.exports = class Foo {
  constructor (x=33) {
    this.x = x ? x : 99
    if (this.x) {
      console.info('covered')
    } else {
      console.info('uncovered')
    }
    this.methodC()
  }
  methodA () {
    console.info('covered')
  }
  methodB () {
    console.info('uncovered')
  }
  methodC () {
    console.info('covered')
  }
  methodD () {
    console.info('uncovered')
  }
}