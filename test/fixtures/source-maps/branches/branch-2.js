module.exports = function branch (a) {
  if (a) {
    console.info('a = true')
  } else if (undefined) {
    console.info('unreachable')
  } else {
    console.info('a = false')
  }
}