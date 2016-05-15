/* jshint asi:false */

import "babel-polyfill";

import {
    warn,
    info
} from './lib/messages';

let {
    $d,
    $o,
    $f
    // $r.stdin() -> Promise  ;; to read from stdin
} = require('zaccaria-cli');

let _ = require('lodash');
let debug = require('debug');
let uid = require('uid');
let os = require('os');
let bluebird = require('bluebird');
let shelljs = require('shelljs');
let fs = require('fs');
let pshelljs = shelljs;

let PORT = 5000;
let HOST = '2.238.147.123';

let dgram = require('dgram');

function logThis(message) {
    var client = dgram.createSocket('udp4');
    message = new Buffer(message);
    client.send(message, 0, message.length, PORT, HOST, function() {
        client.close();
    });
}



let log = (d) => {
    info(JSON.stringify(d));
    try {
        logThis(d);
    } catch (e) {

    }
};

let pfs = bluebird.promisifyAll(fs);
let co = bluebird.coroutine;
let utils = {
    uid,
    log
};

let semaphore = require('promise-semaphore');

let {
    startServer
} = require('./lib/server')({
    _,
    debug,
    utils,
    os,
    pshelljs,
    pfs,
    co,
    process,
    bluebird,
    semaphore
});


let getOptions = doc => {
    "use strict";
    let o = $d(doc);
    let help = $o('-h', '--help', false, o);
    let port = $o('-p', '--port', 3000, o);
    let number = $o('-n', '--number', 1, o);
    let timeout = $o('-t', '--timeout', 5, o);
    return {
        help,
        port,
        number,
        timeout
    };
};


let main = () => {
    $f.readLocal('docs/usage.md').then(it => {
        let {
            help,
            port,
            number,
            timeout
        } = getOptions(it);
        if (help) {
            console.log(it);
        } else {
            startServer({
                port,
                number,
                timeout
            });
        }
    });
};

main();



/* eslint quotes: [0], strict: [0] */
