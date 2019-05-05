const fs = require('fs');

Object.defineProperty(fs, 'promises', {value: undefined});
require('../../bin/c8.js');
