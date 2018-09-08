# c8 - native V8 code-coverage

Code-coverage using [V8's Inspector](https://nodejs.org/dist/latest-v8.x/docs/api/inspector.html)
that's compatible with [Istanbul's reporters](https://istanbul.js.org/docs/advanced/alternative-reporters/).

Like [nyc](https://github.com/istanbuljs/nyc), c8 just magically works:

```bash
npm i c8 -g
c8 node foo.js
```

The above example will collect coverage for `foo.js` using V8's inspector.

## Disclaimer

c8 uses
[bleeding edge Node.js features](https://github.com/nodejs/node/pull/22527),
make sure you're running Node.js `>= 10.10.0`.