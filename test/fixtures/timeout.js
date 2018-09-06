require('./fib')
const {spawnSync} = require('child_process')
// const output = spawnSync(process.execPath, ['./test/fixtures/fib'])
console.info(output.stdout.toString('utf8'))

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
