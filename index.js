#!/usr/bin/env node
'use strict';

require('babel-polyfill');

var _messages = require('./lib/messages');

var _require =
// $r.stdin() -> Promise  ;; to read from stdin
require('zaccaria-cli');

var $d = _require.$d;
var $o = _require.$o;
var $f = _require.$f;


var _ = require('lodash');
var debug = require('debug');
var uid = require('uid');
var os = require('os');
var bluebird = require('bluebird');
var shelljs = require('shelljs');
var fs = require('fs');
var pshelljs = shelljs;
var pfs = bluebird.promisifyAll(fs);
var co = bluebird.coroutine;
var utils = {
    uid: uid
};

var _require2 = require('./lib/server')({ _: _, debug: debug, utils: utils, os: os, pshelljs: pshelljs, pfs: pfs, co: co, process: process, bluebird: bluebird });

var startServer = _require2.startServer;


var getOptions = function getOptions(doc) {
    "use strict";

    var o = $d(doc);
    var help = $o('-h', '--help', false, o);
    var port = $o('-p', '--port', 3000, o);
    return {
        help: help, port: port
    };
};

var main = function main() {
    $f.readLocal('docs/usage.md').then(function (it) {
        var _getOptions = getOptions(it);

        var help = _getOptions.help;
        var port = _getOptions.port;

        if (help) {
            console.log(it);
        } else {
            startServer(port);
        }
    });
};

main();

/* eslint quotes: [0], strict: [0] */