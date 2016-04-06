#!/usr/bin/env node
'use strict';

/* eslint quotes: [0], strict: [0] */

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
    return {
        help: help
    };
};

var main = function main() {
    $f.readLocal('docs/usage.md').then(function (it) {
        var _getOptions = getOptions(it);

        var help = _getOptions.help;

        if (help) {
            console.log(it);
        }
    });
};

main();