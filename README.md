# c8 - native v8 code-coverage

Code-coverage using [v8's Profiler](https://nodejs.org/dist/latest-v8.x/docs/api/inspector.html)
that's compatible with [Istanbul's reporters](https://istanbul.js.org/docs/advanced/alternative-reporters/).

Like [nyc](https://github.com/istanbuljs/nyc), c8 just magically works, simply:

```bash
npm i c8 -g
c8 node foo.js
```

The above example will collect coverage for `foo.js` using v8's profiler.

TODO:

- [ ] write logic for converting v8 coverage output to [Istanbul Coverage.json format](https://github.com/gotwarlost/istanbul/blob/master/coverage.json.md).
- [ ] talk to Node.js project about silencing messages:

   > `Debugger listening on ws://127.0.0.1:56399/e850110a-c5df-41d8-8ef2-400f6829617f`.

- [ ] figure out why `detailed` mode does not appear to be working.
- [ ] figure out a better way to determine that all processes in event loop
   have terminated (except the inspector session).
- [ ] process.exit() can't perform an async operation; how can we track coverage
  for scripts that exit?
