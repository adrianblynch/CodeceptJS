'use strict';

let Mocha = require('mocha/lib/mocha');
let fsPath = require('path');
let readFileSync = require('fs').readFileSync;
let readdirSync = require('fs').readdirSync;
let statSync = require('fs').statSync;
let container = require('./container');
let reporter = require('./reporter/cli');
let event = require('../lib/event');
let glob = require('glob');
const scenarioUi = fsPath.join(__dirname, './interfaces/codeceptjs.js');

class Codecept {

  constructor(config, opts) {
    this.opts = opts;
    this.config = config;
    this.mocha = new Mocha(Object.assign(config.mocha, opts));
    this.mocha.ui(scenarioUi);
    this.mocha.reporter(reporter, opts);
    this.testFiles = [];
  }

  init(dir) {
    global.codecept_dir = dir;
    container.create(this.config);
    require('./listener/steps');
    require('./listener/helpers');
  }

  loadTests(pattern) {
    pattern = pattern || this.config.tests;
    glob.sync(fsPath.join(codecept_dir, pattern)).forEach((file) => {
      this.testFiles.push(fsPath.resolve(file));
    });
  }

  run(test) {
    this.mocha.files = this.testFiles;
    if (test) {
      this.mocha.files = this.mocha.files.filter((t) => fsPath.basename(t, '_test.js') == test || fsPath.basename(t, '.js') == test || fsPath.basename(t) == test);
    }
    this.mocha.run(() => {
      event.dispatcher.emit(event.all.result, this);
    });
  }

  static version() {
    return JSON.parse(readFileSync(__dirname + '/../package.json', 'utf8')).version;
  }
}

module.exports = Codecept;
