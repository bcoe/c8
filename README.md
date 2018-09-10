# c8 - native V8 code-coverage

[![Build Status](https://travis-ci.org/bcoe/c8.svg?branch=master)](https://travis-ci.org/bcoe/c8)
[![Coverage Status](https://coveralls.io/repos/github/bcoe/c8/badge.svg?branch=master)](https://coveralls.io/github/bcoe/c8?branch=master)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Code-coverage using [V8's Inspector](https://nodejs.org/dist/latest-v8.x/docs/api/inspector.html)
that's compatible with [Istanbul's reporters](https://istanbul.js.org/docs/advanced/alternative-reporters/).

Like [nyc](https://github.com/istanbuljs/nyc), c8 just magically works:

```bash
npm i c8 -g
c8 node foo.js
```

The above example will collect coverage for `foo.js` using V8's inspector.

## c8 report

run `c8 report` to regenerate reports after `c8` has already been run.

## Disclaimer

c8 uses
[bleeding edge Node.js features](https://github.com/nodejs/node/pull/22527),
make sure you're running Node.js `>= 10.10.0`.
