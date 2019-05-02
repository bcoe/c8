var ATrue;
(function (ATrue) {
    ATrue[ATrue["IsTrue"] = 1] = "IsTrue";
    ATrue[ATrue["IsFalse"] = 0] = "IsFalse";
})(ATrue || (ATrue = {}));
if (false) {
    console.info('unreachable');
}
else if (true) {
    console.info('reachable');
}
else {
    console.info('unreachable');
}
function branch(a) {
    if (a) {
        console.info('a = true');
    }
    else if (undefined) {
        console.info('unreachable');
    }
    else {
        console.info('a = false');
    }
}
branch(!!ATrue.IsTrue);
branch(!!ATrue.IsFalse);
//# sourceMappingURL=branches.typescript.js.map