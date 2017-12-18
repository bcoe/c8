# c8 - native v8 code-coverage

Code-coverage using [v8's Inspector](https://nodejs.org/dist/latest-v8.x/docs/api/inspector.html)
that's compatible with [Istanbul's reporters](https://istanbul.js.org/docs/advanced/alternative-reporters/).

Like [nyc](https://github.com/istanbuljs/nyc), c8 just magically works:

```bash
npm i c8 -g
c8 node foo.js
```

The above example will collect coverage for `foo.js` using v8's inspector.

## How it Works

Before running your application c8 creates [an inspector session](https://nodejs.org/api/inspector.html) in v8 and enables v8's
[built in coverage reporting](https://v8project.blogspot.com/2017/12/javascript-code-coverage.html).

Just before your application exits, c8 fetches the coverage information from
v8 and writes it to disk in a format compatible with
[Istanbul's reporters](https://istanbul.js.org/).