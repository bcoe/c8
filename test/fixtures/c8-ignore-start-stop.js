const a = 99
const b = true ? 1 : 2
if (true) {
  console.info('covered')
/* c8 ignore start */
} else {
  console.info('uncovered')
}
/* c8 ignore stop */

/* c8 ignore start */ 'ignore me'
function notExecuted () {

}
/* c8 ignore stop */

if (true) {
  console.info('covered')
} else { /* c8 ignore start */
  console.info('uncovered')
}
