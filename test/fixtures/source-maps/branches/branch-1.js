const branch = require('./branch-2')

if (false) {
  console.info('unreachable')
} else if (true) {
  console.info('reachable')
} else {
  console.info('unreachable')
}

branch(true)
branch(false)
