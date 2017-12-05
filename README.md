# c8 - native v8 code-coverage

Code-coverage using [v8's Inspector](https://nodejs.org/dist/latest-v8.x/docs/api/inspector.html)
that's compatible with [Istanbul's reporters](https://istanbul.js.org/docs/advanced/alternative-reporters/).

Like [nyc](https://github.com/istanbuljs/nyc), c8 just magically works:

```bash
npm i c8 -g
c8 node foo.js
```

The above example will collect coverage for `foo.js` using v8's inspector.

## remaining work

- [x] write logic for converting v8 coverage output to [Istanbul Coverage.json format](https://github.com/gotwarlost/istanbul/blob/master/coverage.json.md).
  * https://github.com/bcoe/v8-to-istanbul

- [ ] talk to node.js project about silencing messages:

   > `Debugger listening on ws://127.0.0.1:56399/e850110a-c5df-41d8-8ef2-400f6829617f`.

- [x] figure out why `detailed` mode does not appear to be working.
  * this is fixed in v8, as long as you start with `--inspect-brk` you
    can collect coverage in detailed mode.
- [x] figure out a better way to determine that all processes in event loop
   have terminated (except the inspector session).
- [x] process.exit() can't perform an async operation; how can we track coverage
  for scripts that exit?
  * we can now listen for the `Runtime.executionContextDestroyed` event.
- [x] figure out why instrumentation of .mjs files does not work:
  * see: https://github.com/nodejs/node/issues/17336
