const importMCR = async () => {
  const Report = require('../../lib/report')
  const report = Report({
    monocartArgv: {}
  })
  report.importMonocart = () => {
    throw new Error('not found module')
  }
  await report.run()
}

importMCR();