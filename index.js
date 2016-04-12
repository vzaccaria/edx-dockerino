#!/usr/bin/env node
'use strict';

require('babel-polyfill');

var _messages = require('./messages');

var _server = require('./server');

var _require =
// $r.stdin() -> Promise  ;; to read from stdin
require('zaccaria-cli');

var $d = _require.$d;
var $o = _require.$o;
var $f = _require.$f;


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
            (0, _server.startServer)(port);
        }
    });
};

main();

/* eslint quotes: [0], strict: [0] */