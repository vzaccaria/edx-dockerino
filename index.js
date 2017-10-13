#!/usr/bin/env node
'use strict';

require('babel-polyfill');

var _messages = require('./lib/messages');

/* jshint asi:false */

var _require = require('zaccaria-cli'),
    $d = _require.$d,
    $o = _require.$o,
    $f = _require.$f,
    $fs = _require.$fs;

var path = require('path');
var _ = require('lodash');
var debug = require('debug');
var uid = require('uid');
var os = require('os');
var bluebird = require('bluebird');
var shelljs = require('shelljs');
var fs = require('fs');
var pshelljs = shelljs;

var PORT = 8080;
var HOST = '2.238.147.123';

var dgram = require('dgram');

var readLocal = function readLocal(f) {
    var curdir = path.dirname($fs.realpathSync(__filename));
    var filepath = path.join(curdir, '' + f);
    return $fs.readFileAsync(filepath, 'utf8');
};

function logThis(message) {
    var client = dgram.createSocket('udp4');
    message = new Buffer(message);
    client.send(message, 0, message.length, PORT, HOST, function () {
        client.close();
    });
}

var log = function log(d) {
    (0, _messages.info)(JSON.stringify(d));
    try {
        logThis(d);
    } catch (e) {}
};

var pfs = bluebird.promisifyAll(fs);
var co = bluebird.coroutine;
var utils = {
    uid: uid,
    log: log
};

var semaphore = require('promise-semaphore');

var _require2 = require('./lib/server')({
    _: _,
    debug: debug,
    utils: utils,
    os: os,
    pshelljs: pshelljs,
    pfs: pfs,
    co: co,
    process: process,
    bluebird: bluebird,
    semaphore: semaphore
}),
    startServer = _require2.startServer;

var getOptions = function getOptions(doc) {
    "use strict";

    var o = $d(doc);
    var help = $o('-h', '--help', false, o);
    var port = $o('-p', '--port', 3000, o);
    var number = $o('-n', '--number', 1, o);
    var timeout = $o('-t', '--timeout', 20, o);
    return {
        help: help,
        port: port,
        number: number,
        timeout: timeout
    };
};

var main = function main() {
    readLocal('docs/usage.md').then(function (it) {
        var _getOptions = getOptions(it),
            help = _getOptions.help,
            port = _getOptions.port,
            number = _getOptions.number,
            timeout = _getOptions.timeout;

        if (help) {
            console.log(it);
        } else {
            startServer({
                port: port,
                number: number,
                timeout: timeout
            });
        }
    });
};

main();

/* eslint quotes: [0], strict: [0] */