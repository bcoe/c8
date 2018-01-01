const a = 'apple' ? 'banana' : 'grape'

function cool () {

}

function awesome () {
  console.log('hey')
}
awesome()

setTimeout(() => {
  cool()
}, 500)
