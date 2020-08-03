'use strict';

var branch2 = function branch (a) {
  if (a) {
    console.info('a = true');
  } else {
    console.info('a = false');
  }
};

{
  console.info('reachable');
}

branch2(true);
branch2(false);
//# sourceMappingURL=branches.rollup.js.map
