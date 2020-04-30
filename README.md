# c8 - native V8 code-coverage

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/bcoe/c8/ci)
[![Coverage Status](https://coveralls.io/repos/github/bcoe/c8/badge.svg?branch=master)](https://coveralls.io/github/bcoe/c8?branch=master)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Code-coverage using [Node.js' built in functionality](https://nodejs.org/dist/latest-v10.x/docs/api/cli.html#cli_node_v8_coverage_dir)
that's compatible with [Istanbul's reporters](https://istanbul.js.org/docs/advanced/alternative-reporters/).

Like [nyc](https://github.com/istanbuljs/nyc), c8 just magically works:

```bash
npm i c8 -g
c8 node foo.js
```

The above example will output coverage metrics for `foo.js`.

## Checking for "full" source coverage using `--all`

By default v8 will only give us coverage for files that were loaded by the engine. If there are source files in your 
project that are flexed in production but not in your tests, your coverage numbers will not reflect this. For example,
if your project's `main.js` loads `a.js` and `b.js` but your unit tests only load `a.js` your total coverage 
could show as `100%` for `a.js` when in fact both `main.js` and `b.js` are uncovered.  

By supplying `--all` to c8, all files in `cwd` that pass the `--include` and `--exclude` flag checks, will be loaded into the
report. If any of those files remain uncovered they will be factored into the report with a default of 0% coverage. 

## c8 report

run `c8 report` to regenerate reports after `c8` has already been run.

## Checking coverage

c8 can fail tests if coverage falls below a threshold.
After running your tests with c8, simply run:

```shell
c8 check-coverage --lines 95 --functions 95 --branches 95
```

c8 also accepts a `--check-coverage` shorthand, which can be used to
both run tests and check that coverage falls within the threshold provided:

```shell
c8 --check-coverage --lines 100 npm test
```

The above check fails if coverage falls below 100%.

To check thresholds on a per-file basis run:

```shell
c8 check-coverage --lines 95 --per-file
```

## Ignoring Uncovered Lines, Functions, and Blocks

Sometimes you might find yourself wanting to ignore uncovered portions of your
codebase. For example, perhaps you run your tests on Linux, but
there's some logic that only executes on Windows.

To ignore lines, blocks, and functions, use the special comment:

`/* c8 ignore next */`.

### Ignoring the next element

```js
const myVariable = 99
/* c8 ignore next */
if (process.platform === 'win32') console.info('hello world')
```

### Ignoring the next N elements

```js
const myVariable = 99
/* c8 ignore next 3 */
if (process.platform === 'win32') {
  console.info('hello world')
}
```

### Ignoring a block on the current line

```js
const myVariable = 99
const os = process.platform === 'darwin' ? 'OSXy' /* c8 ignore next */ : 'Windowsy' 
```

## Supported Node.js Versions

c8 uses
[bleeding edge Node.js features](https://github.com/nodejs/node/pull/22527),
make sure you're running Node.js `>= 10.12.0`.

## Contributing to `c8`

See the [contributing guide here](./CONTRIBUTING.md).
