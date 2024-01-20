const os = require('os')
const { helpMessageUnitTest } = require('./help-message')
const isWin = (os.platform() === 'win32')

if (isWin === true) { helpMessageUnitTest() }
