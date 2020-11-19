module.exports = function (dir, cb, platform) {
/*
 * this function will async 'rm -rf' <dir> using platform's native rm/rd command
 */
  // win32
  if ((platform || process.platform) === 'win32') {
    require('child_process').spawn((
      'rd /s /q ' + JSON.stringify(require('path').normalize(dir))
    ), {
      // in win32, 'rd' is bultin-shell-command that cannot run outside shell
      shell: true,
      stdio: 'ignore'
    }).on('error', cb).on('exit', cb.bind(undefined, undefined))
    return
  }
  // posix
  require('child_process').spawn('rm', ['-rf', dir], {
    stdio: 'ignore'
  }).on('error', cb).on('exit', cb.bind(undefined, undefined))
}
