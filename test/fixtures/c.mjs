const foo = true || (9 + 10)

if (true) {
  const a = 9 + 22
} else if (foo) {
  const b = 9 + 10
} else {
  console.info('hey')
}

throw 'cool'
