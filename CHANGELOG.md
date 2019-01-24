# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="3.4.0"></a>
# [3.4.0](https://github.com/bcoe/c8/compare/v3.3.0...v3.4.0) (2019-01-24)


### Features

* support --check-coverage for reports ([#60](https://github.com/bcoe/c8/issues/60)) ([b542930](https://github.com/bcoe/c8/commit/b542930))



<a name="3.3.0"></a>
# [3.3.0](https://github.com/bcoe/c8/compare/v3.2.1...v3.3.0) (2019-01-23)


### Bug Fixes

* file URL to system path conversion ([#46](https://github.com/bcoe/c8/issues/46)) ([e7f8cf2](https://github.com/bcoe/c8/commit/e7f8cf2))
* float patch for branch/function coverage merge bug ([#56](https://github.com/bcoe/c8/issues/56)) ([1de0cca](https://github.com/bcoe/c8/commit/1de0cca))
* snapshot ([7fd9e13](https://github.com/bcoe/c8/commit/7fd9e13))


### Features

* add thresholds for enforcing coverage percentage ([#59](https://github.com/bcoe/c8/issues/59)) ([70e8943](https://github.com/bcoe/c8/commit/70e8943))
* allow script wrapper length to be specified ([#51](https://github.com/bcoe/c8/issues/51)) ([a22c4e0](https://github.com/bcoe/c8/commit/a22c4e0))



<a name="3.2.1"></a>
## [3.2.1](https://github.com/bcoe/c8/compare/v3.2.0...v3.2.1) (2018-10-21)


### Bug Fixes

* address file:// issue with CJS ([#39](https://github.com/bcoe/c8/issues/39)) ([d4f9cab](https://github.com/bcoe/c8/commit/d4f9cab))
* process coverage merging ([#37](https://github.com/bcoe/c8/issues/37)) ([67959b4](https://github.com/bcoe/c8/commit/67959b4))



<a name="3.2.0"></a>
# [3.2.0](https://github.com/bcoe/c8/compare/v3.1.0...v3.2.0) (2018-09-16)


### Bug Fixes

* make tests run on Windows ([#25](https://github.com/bcoe/c8/issues/25)) ([08e44d0](https://github.com/bcoe/c8/commit/08e44d0))


### Features

* improve test assertions ([#28](https://github.com/bcoe/c8/issues/28)) ([522720e](https://github.com/bcoe/c8/commit/522720e))
* warn instead of throw on exception ([#29](https://github.com/bcoe/c8/issues/29)) ([a8620d4](https://github.com/bcoe/c8/commit/a8620d4))



<a name="3.1.0"></a>
# [3.1.0](https://github.com/bcoe/c8/compare/v3.0.3...v3.1.0) (2018-09-11)


### Features

* allow relative paths to be optionally included ([3806c79](https://github.com/bcoe/c8/commit/3806c79))



<a name="3.0.3"></a>
## [3.0.3](https://github.com/bcoe/c8/compare/v3.0.2...v3.0.3) (2018-09-10)



<a name="3.0.2"></a>
## [3.0.2](https://github.com/bcoe/c8/compare/v3.0.1...v3.0.2) (2018-09-10)



<a name="3.0.1"></a>
## [3.0.1](https://github.com/bcoe/c8/compare/v3.0.0...v3.0.1) (2018-09-10)



<a name="3.0.0"></a>
# [3.0.0](https://github.com/bcoe/c8/compare/v1.0.1...v3.0.0) (2018-09-10)

### Features

* switch to using Node's built in coverage ([#22](https://github.com/bcoe/c8/issues/22)) ([3c1b92b](https://github.com/bcoe/c8/commit/3c1b92b))


### BREAKING CHANGES

* switches to using NODE_V8_COVERAGE rather than inspector directly


<a name="2.0.0"></a>
# [2.0.0](https://github.com/bcoe/c8/compare/v1.0.1...v2.0.0) (2017-12-17)


### Bug Fixes

* tweak inspector event timing ([#6](https://github.com/bcoe/c8/issues/6)) ([01f654e](https://github.com/bcoe/c8/commit/01f654e))


### Features

* first pass at functional prototype without subprocess support ([#5](https://github.com/bcoe/c8/issues/5)) ([9534f56](https://github.com/bcoe/c8/commit/9534f56))
* implement Istanbul reporting ([#8](https://github.com/bcoe/c8/issues/8)) ([8e430bf](https://github.com/bcoe/c8/commit/8e430bf))
* switch to stderr and default port ([#7](https://github.com/bcoe/c8/issues/7)) ([bb117b7](https://github.com/bcoe/c8/commit/bb117b7))


### BREAKING CHANGES

* dropped subprocess support for the time being, while we march towards an initial implementation.



<a name="1.0.1"></a>
## [1.0.1](https://github.com/bcoe/c8/compare/v1.0.0...v1.0.1) (2017-10-26)


### Bug Fixes

* pin to functional version of spawn-wrap ([d1ced8c](https://github.com/bcoe/c8/commit/d1ced8c))



<a name="1.0.0"></a>
# 1.0.0 (2017-10-26)


### Features

* playing around with initial implementation ([18f5471](https://github.com/bcoe/c8/commit/18f5471))
