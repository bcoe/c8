process.env.TS_NODE_SKIP_PROJECT = true

const config = {
  "diff": true,
  "extension": ["*"],
  "package": "./package.json",
  "reporter": "spec",
  "slow": 1000,
  "timeout": 10000,
  "ui": "bdd",
  "watch-files": ["./test/*.spec.js"],
  "node-option": ["max-old-space-size=5120"],
  "jobs": 30
}

module.exports = config
