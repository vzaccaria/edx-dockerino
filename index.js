#!/usr/bin/env node
'use strict';

require('babel-polyfill');

var _messages = require('./messages');

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

var startServer = function startServer() {
    var port = arguments.length <= 0 || arguments[0] === undefined ? 3000 : arguments[0];

    var app = require('koa')();
    var router = require('koa-router')();

    app.use(router.routes()).use(router.allowedMethods());

    app.use(router.routes());

    router.get("/", regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        this.response.body = [1, 2, 3, 4, 5];
                        this.response.status = 200;

                    case 2:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    app.listen(port, function () {
        (0, _messages.info)('App listening on port ' + port + '.');
    });
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