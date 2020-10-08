function fn() {
  return true;
  /* c8 ignore next */
  console.log('never runs');
}

fn();