const {spawnSync} = require('child_process')
{
  const output = spawnSync(process.execPath, ['./test/fixtures/subprocess',
                           '1'])
  console.info(output.stdout.toString('utf8'))
}

{
  const output = spawnSync(process.execPath, ['./test/fixtures/subprocess',
                           '2'])
  console.info(output.stdout.toString('utf8'))
}
