const Report = require('../../../lib/report')
const report = new Report({
  basePath: '.',
  include: [
    '../multidir1/**/*.js',
    '../multidir2/**/*.js'
  ],
  exclude: [],
  reporter: ['text'],
  tempDirectory: './temp',
  omitRelative: true
})
report.run()
