enum ATrue {
  IsTrue = 1,
  IsFalse = 0
}

if (false) {
  console.info('unreachable')
} else if (true) {
  console.info('reachable')
} else {
  console.info('unreachable')
}

function branch (a: boolean) {
  if (a) {
    console.info('a = true')
  } else if (undefined) {
    console.info('unreachable')
  } else {
    console.info('a = false')
  }
}

branch(!!ATrue.IsTrue)
branch(!!ATrue.IsFalse)
