# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [5.0.4](https://github.com/bcoe/c8/compare/v5.0.3...v5.0.4) (2019-09-06)


### Bug Fixes

* **deps:** merging failed when the same script occurred multiple times in the same report ([#147](https://github.com/bcoe/c8/issues/147)) ([1ebcaf9](https://github.com/bcoe/c8/commit/1ebcaf9))
* don't load JSON that does not look like coverage ([#146](https://github.com/bcoe/c8/issues/146)) ([a6481f1](https://github.com/bcoe/c8/commit/a6481f1))
* **deps:** update dependency yargs-parser to v14 ([#144](https://github.com/bcoe/c8/issues/144)) ([9b3d089](https://github.com/bcoe/c8/commit/9b3d089))

### [5.0.3](https://www.github.com/bcoe/c8/compare/v5.0.2...v5.0.3) (2019-09-06)


### Bug Fixes

* **deps:** update dependency rimraf to v3 ([#132](https://www.github.com/bcoe/c8/issues/132)) ([7601748](https://www.github.com/bcoe/c8/commit/7601748))
* **deps:** update dependency yargs to v14 ([#134](https://www.github.com/bcoe/c8/issues/134)) ([e49737f](https://www.github.com/bcoe/c8/commit/e49737f))
* **deps:** update deps to address warning in cross-spawn ([#141](https://www.github.com/bcoe/c8/issues/141)) ([4b66221](https://www.github.com/bcoe/c8/commit/4b66221))

### [5.0.2](https://www.github.com/bcoe/c8/compare/v5.0.1...v5.0.2) (2019-06-24)


### Bug Fixes

* HTML report now has correct source positions for Node >10.16.0 ([#125](https://www.github.com/bcoe/c8/issues/125)) ([c49fa7f](https://www.github.com/bcoe/c8/commit/c49fa7f))
* **deps:** update dependency find-up to v4 ([#119](https://www.github.com/bcoe/c8/issues/119)) ([c568d96](https://www.github.com/bcoe/c8/commit/c568d96))
* **deps:** update dependency yargs-parser to v13 ([#124](https://www.github.com/bcoe/c8/issues/124)) ([1eb3394](https://www.github.com/bcoe/c8/commit/1eb3394))
* do not override NODE_V8_COVERAGE if set ([#70](https://www.github.com/bcoe/c8/issues/70)) ([8bb67b0](https://www.github.com/bcoe/c8/commit/8bb67b0))

### [5.0.1](https://www.github.com/bcoe/c8/compare/v5.0.0...v5.0.1) (2019-05-20)


### Bug Fixes

* temporary files should be in tmp folder ([#106](https://www.github.com/bcoe/c8/issues/106)) ([64dd2e6](https://www.github.com/bcoe/c8/commit/64dd2e6))

## [5.0.0](https://www.github.com/bcoe/c8/compare/v4.1.5...v5.0.0) (2019-05-20)


### ⚠ BREAKING CHANGES

* temp directory now defaults to setting for report directory

### Features

* default temp directory to report directory ([#102](https://www.github.com/bcoe/c8/issues/102)) ([8602f4a](https://www.github.com/bcoe/c8/commit/8602f4a))
* load .nycrc/.nycrc.json to simplify migration ([#100](https://www.github.com/bcoe/c8/issues/100)) ([bd7484f](https://www.github.com/bcoe/c8/commit/bd7484f))

### [4.1.5](https://github.com/bcoe/c8/compare/v4.1.4...v4.1.5) (2019-05-11)


### Bug Fixes

* exit with code 1 when report output fails ([#92](https://github.com/bcoe/c8/issues/92)) ([a27b694](https://github.com/bcoe/c8/commit/a27b694))
* remove the unmaintained mkdirp dependency ([#91](https://github.com/bcoe/c8/issues/91)) ([a465b65](https://github.com/bcoe/c8/commit/a465b65))



## [4.1.4](https://github.com/bcoe/c8/compare/v4.1.3...v4.1.4) (2019-05-03)


### Bug Fixes

* we were not exiting with 1 if mkdir failed ([#89](https://github.com/bcoe/c8/issues/89)) ([fb02ed6](https://github.com/bcoe/c8/commit/fb02ed6))



## [4.1.3](https://github.com/bcoe/c8/compare/v4.1.2...v4.1.3) (2019-05-03)


### Bug Fixes

* switch to mkdirp for Node 8 ([206b83f](https://github.com/bcoe/c8/commit/206b83f))



## [4.1.2](https://github.com/bcoe/c8/compare/v4.1.1...v4.1.2) (2019-05-02)


### Bug Fixes

* make tmp directory regardless of clean ([44d2185](https://github.com/bcoe/c8/commit/44d2185))



## [4.1.1](https://github.com/bcoe/c8/compare/v4.1.0...v4.1.1) (2019-05-02)



# [4.1.0](https://github.com/bcoe/c8/compare/v4.0.0...v4.1.0) (2019-05-02)


### Bug Fixes

* exclude coverage of the CJS-ESM bridge from results ([#83](https://github.com/bcoe/c8/issues/83)) ([da2c945](https://github.com/bcoe/c8/commit/da2c945))
* upgrade to @bcoe/v8-coverage with breaking regex dropped ([6c28e7f](https://github.com/bcoe/c8/commit/6c28e7f))


### Features

* add --report-dir alias (for consistency with nyc) ([0dd1b04](https://github.com/bcoe/c8/commit/0dd1b04))
* add support for ignoring lines, functions, and blocks ([#87](https://github.com/bcoe/c8/issues/87)) ([c66950e](https://github.com/bcoe/c8/commit/c66950e))



# [4.0.0](https://github.com/bcoe/c8/compare/v3.5.0...v4.0.0) (2019-05-02)


### Features

* add support for 1:1 source-maps ([#85](https://github.com/bcoe/c8/issues/85)) ([6ca4345](https://github.com/bcoe/c8/commit/6ca4345))
* foreground-child's done() method was not being called ([#82](https://github.com/bcoe/c8/issues/82)) ([fde596e](https://github.com/bcoe/c8/commit/fde596e))


### BREAKING CHANGES

* c8 will now load source-maps if possible and remap coverage accordingly



# [3.5.0](https://github.com/bcoe/c8/compare/v3.4.0...v3.5.0) (2019-04-12)


### Features

* allow  --reports-dir to be configured ([#65](https://github.com/bcoe/c8/issues/65)) ([5ab31f5](https://github.com/bcoe/c8/commit/5ab31f5))



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
