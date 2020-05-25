const Report = require('../../../lib/report')
const report = new Report({
  include: ['**/*.js'],
  exclude: [],
  reporter: ['text'],
  tempDirectory: './temp',
  omitRelative: true,
  all: true,
  src: '../multidir1/',
  allowExternal: true
})
report.run()
