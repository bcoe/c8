const { mkdirSync, copyFileSync, rmSync, existsSync } = require('fs')
const { join } = require('path')

const testPath = './test/fixtures/tmp-config-test'

const testConfigFile = function (filePath, fileNameLineNumberMap, callback) {
  Object.keys(fileNameLineNumberMap).forEach((fileName) => {
    const expectedLines = fileNameLineNumberMap[fileName]
    callback(fileName, expectedLines)
  })
}

const beforeTestReadingConfigFile = (configFileName) => {
  afterTestReadingConfigFile()
  // make the directory tmp-config-test
  mkdirSync(testPath)

  // Copy config file in fileName and test/fixtures/normal.js to dir above
  copyFileSync('./test/fixtures/normal.js', join(testPath, '/normal.js'))
  copyFileSync('./test/fixtures/async.js', join(testPath, '/async.js'))
  copyFileSync('./test/fixtures/config/' + configFileName, join(testPath, configFileName))
}

const afterTestReadingConfigFile = () => {
  if (existsSync(testPath)) {
    rmSync(testPath, { recursive: true, force: true })
  }
}

module.exports = {
  testConfigFile: testConfigFile,
  beforeTestReadingConfigFile: beforeTestReadingConfigFile,
  afterTestReadingConfigFile: afterTestReadingConfigFile
}
