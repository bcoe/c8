"use strict";
exports.__esModule = true;
var Foo = /** @class */ (function () {
    function Foo(options) {
        this.x = options.x ? options.x : 99;
        if (this.x) {
            console.info('covered');
        }
        else {
            console.info('uncovered');
        }
        this.methodC();
    }
    Foo.prototype.methodA = function () {
        console.info('covered');
        return 33;
    };
    Foo.prototype.methodB = function () {
        console.info('uncovered');
    };
    Foo.prototype.methodC = function () {
        console.info('covered');
    };
    Foo.prototype.methodD = function () {
        console.info('uncovered');
    };
    return Foo;
}());
var a = new Foo({ x: 0 });
var b = new Foo({ x: 33 });
a.methodA();
//# sourceMappingURL=classes.typescript.js.map