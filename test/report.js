/* global describe, it */
const { MockReport } = require('./report-mock.js')
const { buildYargs, hideInstrumenteeArgs } = require('../lib/parse-args')
const { existsSync, mkdirSync } = require('fs')
const { resolve } = require('path')
const chai = require('chai')
const spies = require('chai-spies')

chai.use(spies)
const { expect } = chai
const nodePath = process.execPath
const nodeMajorVersion = Number(process.version.slice(1).split('.')[0])

describe('report', () => {
  if (nodeMajorVersion > 10) {
    /**
     * cause Report._loadReports to throw an error and catch it to increase code coverage
     *
     * Strategy:
     * Add a non json file to the temporary directory to cause _loadReports to throw
     * an error.  Do this before running reports constructor and after manually creating
     * the temporary directory
     *
     */
    it('cause Report._loadReports to throw an error and catch it', async () => {
      const cwd = process.cwd()
      const esmDirPath = resolve(cwd, 'tmp/esm')

      if (!existsSync(esmDirPath)) {
        mkdirSync(esmDirPath, { recursive: true })
      }

      const args = [
        'node', 'c8',
        '--exclude="test/*.js"',
        '--clean=false',
        '--temp-directory=tmp/esm',
        nodePath,
        '--experimental-modules',
        '--no-warnings',
        resolve('./fixtures/import.mjs')
      ]

      const testSpy = chai.spy
      const report = MockReportTestCase(args, testSpy, '_loadReports: throw error')

      const stdOutWriteStream = process.stdout.write
      // redirect stdout to /dev/null for a line
      process.stdout.write = () => {}
      try {
        await report.run()
      } catch (e) {
        console.error(e)
      } finally {
        process.stdout.write = stdOutWriteStream
        const spy = report.getSpy()
        expect(spy.toString()).equal('{ Spy }')
        expect(report._loadReports).to.have.been.called()
        expect(JSON.parse).to.have.been.called()
        testSpy.restore()
      }
    })

    /**
     * cause Report._normalizeProcessCov to throw an error and catch it to increase code
     * coverage
     *
     * Strategy:
     * Line 279 of report.js: fileURLToPath to throw an error
     * OR
     * Line 280 of report.js: fileIndex.add to throw an error
     * Function documentation
     * https://nodejs.org/docs/latest-v10.x/api/url.html#url_url_fileurltopath_url
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/add
     *
     */
    it('cause Report._normalizeProcessCov to throw an error and catch it', async () => {
      const args = [
        'node', 'c8',
        '--exclude="test/*.js"',
        '--clean=false',
        '--temp-directory=tmp/esm',
        nodePath,
        '--experimental-modules',
        '--no-warnings',
        resolve('./fixtures/import.mjs')
      ]

      const testSpy = chai.spy
      const report = MockReportTestCase(args, testSpy, '_normalizeProcessCov: throw error')

      const stdOutWriteStream = process.stdout.write
      // redirect stdout to /dev/null for a line
      process.stdout.write = () => {}
      try {
        await report.run()
      } finally {
        process.stdout.write = stdOutWriteStream
        const spy = report.getSpy()
        expect(spy.toString()).equal('{ Spy }')
        expect(report._normalizeProcessCov).to.have.been.called()
        expect(Set.prototype.add).to.have.been.called()
        testSpy.restore()
      }
    })
  } else {
    it('Skip: Node version 10 or less', () => {
      expect(true).to.equal(true)
    })
  }
})

const MockReportTestCase = (args, spy, testCaseKey) => {
  const pArgsv = process.argv
  process.argv = args
  const argv = buildYargs().parse(hideInstrumenteeArgs())
  process.argv = pArgsv
  const opts = {
    include: argv.include,
    exclude: argv.exclude,
    extension: argv.extension,
    excludeAfterRemap: argv.excludeAfterRemap,
    reporter: Array.isArray(argv.reporter) ? argv.reporter : [argv.reporter],
    reportsDirectory: argv['reports-dir'],
    tempDirectory: argv.tempDirectory,
    watermarks: argv.watermarks,
    resolve: argv.resolve,
    omitRelative: argv.omitRelative,
    wrapperLength: argv.wrapperLength,
    all: argv.all,
    allowExternal: argv.allowExternal,
    src: argv.src,
    skipFull: argv.skipFull,
    excludeNodeModules: argv.excludeNodeModules
  }

  const report = MockReport(opts, spy, testCaseKey)

  return report
}
