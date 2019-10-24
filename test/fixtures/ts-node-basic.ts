export interface FooOptions {
  x: number;
}

class Foo {
  x: number;
  constructor (options: FooOptions) {
    this.x = options.x ? options.x : 99
    if (this.x) {
      console.info('covered')
    } else {
      console.info('uncovered')
    }
    this.methodC()
  }
  methodA (): number {
    console.info('covered')
    return 33
  }
  /* c8 ignore next 3 */
  methodB () {
    console.info('uncovered')
  }
  private methodC () {
    console.info('covered')
  }
  methodD () {
    console.info('uncovered')
  }
}

const a = new Foo({x: 0})
const b = new Foo({x: 33})
a.methodA()
