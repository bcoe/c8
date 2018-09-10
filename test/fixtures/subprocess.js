function first () {
  console.info('first')
}

function second () {
  console.info('second')
}

if (process.argv[2] === '1') {
  first()
}

if (process.argv[2] === '2') {
  second()
}