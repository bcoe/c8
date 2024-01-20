const os = require('os')
const { printConfigUnitTest } = require('./print-config')
const isWin = (os.platform() === 'win32')

if (isWin === false) { printConfigUnitTest() }
