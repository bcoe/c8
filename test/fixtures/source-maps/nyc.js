function cool () {

}

function awesome () {
  console.log('hey')
}
awesome()

function notCovered () {
  console.info('hey I am not covered')
}

class Cool {
  constructor () {
    console.info('I am covered')
  }
  notCovered () {
    console.info('this function is not')
  }
}

setTimeout(() => {
  cool()
}, 500)
