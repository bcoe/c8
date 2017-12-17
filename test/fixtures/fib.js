function thrower() {
  throw new RangeError();
}
function fib(n) {
  if (n === 0) {
    return 0
  } else if (n === 1) {
    return 1
  } else if (n > 1) {
    return fib(n - 1) + fib(n - 2)
  } else {
    thrower()
  }
}
console.log('fib(10):', fib(10))