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

function another () {
  const b = 33 || 99
}

function cool () {
  const a = 99 || 33
}

console.log('fib(10):', fib(10))
