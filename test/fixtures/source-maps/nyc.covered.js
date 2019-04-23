var cov_2e11oanyc7 = function () {
  var path = "/Users/benjamincoe/bcoe/c8/test/fixtures/source-maps/nyc.js";
  var hash = "a159f10e63eb2f594fe148dacbe3b4283f68dee5";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "/Users/benjamincoe/bcoe/c8/test/fixtures/source-maps/nyc.js",
    statementMap: {
      "0": {
        start: {
          line: 6,
          column: 2
        },
        end: {
          line: 6,
          column: 20
        }
      },
      "1": {
        start: {
          line: 8,
          column: 0
        },
        end: {
          line: 8,
          column: 9
        }
      },
      "2": {
        start: {
          line: 11,
          column: 2
        },
        end: {
          line: 11,
          column: 38
        }
      },
      "3": {
        start: {
          line: 16,
          column: 4
        },
        end: {
          line: 16,
          column: 32
        }
      },
      "4": {
        start: {
          line: 19,
          column: 4
        },
        end: {
          line: 19,
          column: 40
        }
      },
      "5": {
        start: {
          line: 23,
          column: 0
        },
        end: {
          line: 25,
          column: 7
        }
      },
      "6": {
        start: {
          line: 24,
          column: 2
        },
        end: {
          line: 24,
          column: 8
        }
      }
    },
    fnMap: {
      "0": {
        name: "cool",
        decl: {
          start: {
            line: 1,
            column: 9
          },
          end: {
            line: 1,
            column: 13
          }
        },
        loc: {
          start: {
            line: 1,
            column: 17
          },
          end: {
            line: 3,
            column: 1
          }
        },
        line: 1
      },
      "1": {
        name: "awesome",
        decl: {
          start: {
            line: 5,
            column: 9
          },
          end: {
            line: 5,
            column: 16
          }
        },
        loc: {
          start: {
            line: 5,
            column: 20
          },
          end: {
            line: 7,
            column: 1
          }
        },
        line: 5
      },
      "2": {
        name: "notCovered",
        decl: {
          start: {
            line: 10,
            column: 9
          },
          end: {
            line: 10,
            column: 19
          }
        },
        loc: {
          start: {
            line: 10,
            column: 23
          },
          end: {
            line: 12,
            column: 1
          }
        },
        line: 10
      },
      "3": {
        name: "(anonymous_3)",
        decl: {
          start: {
            line: 15,
            column: 2
          },
          end: {
            line: 15,
            column: 3
          }
        },
        loc: {
          start: {
            line: 15,
            column: 17
          },
          end: {
            line: 17,
            column: 3
          }
        },
        line: 15
      },
      "4": {
        name: "(anonymous_4)",
        decl: {
          start: {
            line: 18,
            column: 2
          },
          end: {
            line: 18,
            column: 3
          }
        },
        loc: {
          start: {
            line: 18,
            column: 16
          },
          end: {
            line: 20,
            column: 3
          }
        },
        line: 18
      },
      "5": {
        name: "(anonymous_5)",
        decl: {
          start: {
            line: 23,
            column: 11
          },
          end: {
            line: 23,
            column: 12
          }
        },
        loc: {
          start: {
            line: 23,
            column: 17
          },
          end: {
            line: 25,
            column: 1
          }
        },
        line: 23
      }
    },
    branchMap: {},
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0
    },
    f: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    },
    b: {},
    _coverageSchema: "43e27e138ebf9cfc5966b082cf9a028302ed4184",
    hash: "a159f10e63eb2f594fe148dacbe3b4283f68dee5"
  };
  var coverage = global[gcv] || (global[gcv] = {});

  if (coverage[path] && coverage[path].hash === hash) {
    return coverage[path];
  }

  return coverage[path] = coverageData;
}();

function cool() {
  cov_2e11oanyc7.f[0]++;
}

function awesome() {
  cov_2e11oanyc7.f[1]++;
  cov_2e11oanyc7.s[0]++;
  console.log('hey');
}

cov_2e11oanyc7.s[1]++;
awesome();

function notCovered() {
  cov_2e11oanyc7.f[2]++;
  cov_2e11oanyc7.s[2]++;
  console.info('hey I am not covered');
}

class Cool {
  constructor() {
    cov_2e11oanyc7.f[3]++;
    cov_2e11oanyc7.s[3]++;
    console.info('I am covered');
  }

  notCovered() {
    cov_2e11oanyc7.f[4]++;
    cov_2e11oanyc7.s[4]++;
    console.info('this function is not');
  }

}

cov_2e11oanyc7.s[5]++;
setTimeout(() => {
  cov_2e11oanyc7.f[5]++;
  cov_2e11oanyc7.s[6]++;
  cool();
}, 500);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9iZW5qYW1pbmNvZS9iY29lL2M4L3Rlc3QvZml4dHVyZXMvc291cmNlLW1hcHMvbnljLmpzIl0sIm5hbWVzIjpbImNvb2wiLCJhd2Vzb21lIiwiY29uc29sZSIsImxvZyIsIm5vdENvdmVyZWQiLCJpbmZvIiwiQ29vbCIsImNvbnN0cnVjdG9yIiwic2V0VGltZW91dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLFNBQVNBLElBQVQsR0FBaUI7QUFBQTtBQUVoQjs7QUFFRCxTQUFTQyxPQUFULEdBQW9CO0FBQUE7QUFBQTtBQUNsQkMsRUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksS0FBWjtBQUNEOzs7QUFDREYsT0FBTzs7QUFFUCxTQUFTRyxVQUFULEdBQXVCO0FBQUE7QUFBQTtBQUNyQkYsRUFBQUEsT0FBTyxDQUFDRyxJQUFSLENBQWEsc0JBQWI7QUFDRDs7QUFFRCxNQUFNQyxJQUFOLENBQVc7QUFDVEMsRUFBQUEsV0FBVyxHQUFJO0FBQUE7QUFBQTtBQUNiTCxJQUFBQSxPQUFPLENBQUNHLElBQVIsQ0FBYSxjQUFiO0FBQ0Q7O0FBQ0RELEVBQUFBLFVBQVUsR0FBSTtBQUFBO0FBQUE7QUFDWkYsSUFBQUEsT0FBTyxDQUFDRyxJQUFSLENBQWEsc0JBQWI7QUFDRDs7QUFOUTs7O0FBU1hHLFVBQVUsQ0FBQyxNQUFNO0FBQUE7QUFBQTtBQUNmUixFQUFBQSxJQUFJO0FBQ0wsQ0FGUyxFQUVQLEdBRk8sQ0FBViIsInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIGNvb2wgKCkge1xuXG59XG5cbmZ1bmN0aW9uIGF3ZXNvbWUgKCkge1xuICBjb25zb2xlLmxvZygnaGV5Jylcbn1cbmF3ZXNvbWUoKVxuXG5mdW5jdGlvbiBub3RDb3ZlcmVkICgpIHtcbiAgY29uc29sZS5pbmZvKCdoZXkgSSBhbSBub3QgY292ZXJlZCcpXG59XG5cbmNsYXNzIENvb2wge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgY29uc29sZS5pbmZvKCdJIGFtIGNvdmVyZWQnKVxuICB9XG4gIG5vdENvdmVyZWQgKCkge1xuICAgIGNvbnNvbGUuaW5mbygndGhpcyBmdW5jdGlvbiBpcyBub3QnKVxuICB9XG59XG5cbnNldFRpbWVvdXQoKCkgPT4ge1xuICBjb29sKClcbn0sIDUwMClcbiJdfQ==
