function cov_1x8fqezg3v() {
  var path = "/Users/bencoe/oss/c8/test/fixtures/source-maps/branches/branches.js";
  var hash = "b58d3fb1cc3f2f3dac85400f5867c5747bee2f12";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/Users/bencoe/oss/c8/test/fixtures/source-maps/branches/branches.js",
    statementMap: {
      "0": {
        start: {
          line: 1,
          column: 0
        },
        end: {
          line: 7,
          column: 1
        }
      },
      "1": {
        start: {
          line: 2,
          column: 2
        },
        end: {
          line: 2,
          column: 29
        }
      },
      "2": {
        start: {
          line: 3,
          column: 7
        },
        end: {
          line: 7,
          column: 1
        }
      },
      "3": {
        start: {
          line: 4,
          column: 2
        },
        end: {
          line: 4,
          column: 27
        }
      },
      "4": {
        start: {
          line: 6,
          column: 2
        },
        end: {
          line: 6,
          column: 29
        }
      },
      "5": {
        start: {
          line: 10,
          column: 2
        },
        end: {
          line: 16,
          column: 3
        }
      },
      "6": {
        start: {
          line: 11,
          column: 4
        },
        end: {
          line: 11,
          column: 28
        }
      },
      "7": {
        start: {
          line: 12,
          column: 9
        },
        end: {
          line: 16,
          column: 3
        }
      },
      "8": {
        start: {
          line: 13,
          column: 4
        },
        end: {
          line: 13,
          column: 31
        }
      },
      "9": {
        start: {
          line: 15,
          column: 4
        },
        end: {
          line: 15,
          column: 29
        }
      },
      "10": {
        start: {
          line: 19,
          column: 0
        },
        end: {
          line: 19,
          column: 12
        }
      },
      "11": {
        start: {
          line: 20,
          column: 0
        },
        end: {
          line: 20,
          column: 13
        }
      }
    },
    fnMap: {
      "0": {
        name: "branch",
        decl: {
          start: {
            line: 9,
            column: 9
          },
          end: {
            line: 9,
            column: 15
          }
        },
        loc: {
          start: {
            line: 9,
            column: 20
          },
          end: {
            line: 17,
            column: 1
          }
        },
        line: 9
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 1,
            column: 0
          },
          end: {
            line: 7,
            column: 1
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 1,
            column: 0
          },
          end: {
            line: 7,
            column: 1
          }
        }, {
          start: {
            line: 1,
            column: 0
          },
          end: {
            line: 7,
            column: 1
          }
        }],
        line: 1
      },
      "1": {
        loc: {
          start: {
            line: 3,
            column: 7
          },
          end: {
            line: 7,
            column: 1
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 3,
            column: 7
          },
          end: {
            line: 7,
            column: 1
          }
        }, {
          start: {
            line: 3,
            column: 7
          },
          end: {
            line: 7,
            column: 1
          }
        }],
        line: 3
      },
      "2": {
        loc: {
          start: {
            line: 10,
            column: 2
          },
          end: {
            line: 16,
            column: 3
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 10,
            column: 2
          },
          end: {
            line: 16,
            column: 3
          }
        }, {
          start: {
            line: 10,
            column: 2
          },
          end: {
            line: 16,
            column: 3
          }
        }],
        line: 10
      },
      "3": {
        loc: {
          start: {
            line: 12,
            column: 9
          },
          end: {
            line: 16,
            column: 3
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 12,
            column: 9
          },
          end: {
            line: 16,
            column: 3
          }
        }, {
          start: {
            line: 12,
            column: 9
          },
          end: {
            line: 16,
            column: 3
          }
        }],
        line: 12
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0
    },
    f: {
      "0": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0],
      "2": [0, 0],
      "3": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "b58d3fb1cc3f2f3dac85400f5867c5747bee2f12"
  };
  var coverage = global[gcv] || (global[gcv] = {});

  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }

  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_1x8fqezg3v = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}

cov_1x8fqezg3v();
cov_1x8fqezg3v().s[0]++;

if (false) {
  cov_1x8fqezg3v().b[0][0]++;
  cov_1x8fqezg3v().s[1]++;
  console.info('unreachable');
} else {
  cov_1x8fqezg3v().b[0][1]++;
  cov_1x8fqezg3v().s[2]++;

  if (true) {
    cov_1x8fqezg3v().b[1][0]++;
    cov_1x8fqezg3v().s[3]++;
    console.info('reachable');
  } else {
    cov_1x8fqezg3v().b[1][1]++;
    cov_1x8fqezg3v().s[4]++;
    console.info('unreachable');
  }
}

function branch(a) {
  cov_1x8fqezg3v().f[0]++;
  cov_1x8fqezg3v().s[5]++;

  if (a) {
    cov_1x8fqezg3v().b[2][0]++;
    cov_1x8fqezg3v().s[6]++;
    console.info('a = true');
  } else {
    cov_1x8fqezg3v().b[2][1]++;
    cov_1x8fqezg3v().s[7]++;

    if (undefined) {
      cov_1x8fqezg3v().b[3][0]++;
      cov_1x8fqezg3v().s[8]++;
      console.info('unreachable');
    } else {
      cov_1x8fqezg3v().b[3][1]++;
      cov_1x8fqezg3v().s[9]++;
      console.info('a = false');
    }
  }
}

cov_1x8fqezg3v().s[10]++;
branch(true);
cov_1x8fqezg3v().s[11]++;
branch(false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJyYW5jaGVzLmpzIl0sIm5hbWVzIjpbImNvbnNvbGUiLCJpbmZvIiwiYnJhbmNoIiwiYSIsInVuZGVmaW5lZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlWTs7Ozs7Ozs7Ozs7QUFmWixJQUFJLEtBQUosRUFBVztBQUFBO0FBQUE7QUFDVEEsRUFBQUEsT0FBTyxDQUFDQyxJQUFSLENBQWEsYUFBYjtBQUNELENBRkQsTUFFTztBQUFBO0FBQUE7O0FBQUEsTUFBSSxJQUFKLEVBQVU7QUFBQTtBQUFBO0FBQ2ZELElBQUFBLE9BQU8sQ0FBQ0MsSUFBUixDQUFhLFdBQWI7QUFDRCxHQUZNLE1BRUE7QUFBQTtBQUFBO0FBQ0xELElBQUFBLE9BQU8sQ0FBQ0MsSUFBUixDQUFhLGFBQWI7QUFDRDtBQUFBOztBQUVELFNBQVNDLE1BQVQsQ0FBaUJDLENBQWpCLEVBQW9CO0FBQUE7QUFBQTs7QUFDbEIsTUFBSUEsQ0FBSixFQUFPO0FBQUE7QUFBQTtBQUNMSCxJQUFBQSxPQUFPLENBQUNDLElBQVIsQ0FBYSxVQUFiO0FBQ0QsR0FGRCxNQUVPO0FBQUE7QUFBQTs7QUFBQSxRQUFJRyxTQUFKLEVBQWU7QUFBQTtBQUFBO0FBQ3BCSixNQUFBQSxPQUFPLENBQUNDLElBQVIsQ0FBYSxhQUFiO0FBQ0QsS0FGTSxNQUVBO0FBQUE7QUFBQTtBQUNMRCxNQUFBQSxPQUFPLENBQUNDLElBQVIsQ0FBYSxXQUFiO0FBQ0Q7QUFBQTtBQUNGOzs7QUFFREMsTUFBTSxDQUFDLElBQUQsQ0FBTjs7QUFDQUEsTUFBTSxDQUFDLEtBQUQsQ0FBTiIsInNvdXJjZXNDb250ZW50IjpbImlmIChmYWxzZSkge1xuICBjb25zb2xlLmluZm8oJ3VucmVhY2hhYmxlJylcbn0gZWxzZSBpZiAodHJ1ZSkge1xuICBjb25zb2xlLmluZm8oJ3JlYWNoYWJsZScpXG59IGVsc2Uge1xuICBjb25zb2xlLmluZm8oJ3VucmVhY2hhYmxlJylcbn1cblxuZnVuY3Rpb24gYnJhbmNoIChhKSB7XG4gIGlmIChhKSB7XG4gICAgY29uc29sZS5pbmZvKCdhID0gdHJ1ZScpXG4gIH0gZWxzZSBpZiAodW5kZWZpbmVkKSB7XG4gICAgY29uc29sZS5pbmZvKCd1bnJlYWNoYWJsZScpXG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5pbmZvKCdhID0gZmFsc2UnKVxuICB9XG59XG5cbmJyYW5jaCh0cnVlKVxuYnJhbmNoKGZhbHNlKVxuIl19
