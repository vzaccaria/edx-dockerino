import "babel-polyfill";

import { warn, info } from './lib/messages'

let {
    $d, $o, $f
    // $r.stdin() -> Promise  ;; to read from stdin
} = require('zaccaria-cli')

let _ = require('lodash')
let debug = require('debug')
let uid = require('uid')
let os = require('os')
let bluebird = require('bluebird')
let shelljs = require('shelljs')
let fs = require('fs')
let pshelljs = shelljs;
let pfs = bluebird.promisifyAll(fs)
let co = bluebird.coroutine
let utils = {
    uid
}

let { startServer } = require('./lib/server')({_, debug, utils, os, pshelljs, pfs, co, process, bluebird})


let getOptions = doc => {
    "use strict"
    let o = $d(doc)
    let help = $o('-h', '--help', false, o)
    let port = $o('-p', '--port', 3000, o);
    return {
        help, port
    }
}


let main = () => {
    $f.readLocal('docs/usage.md').then(it => {
        let {
            help, port
        } = getOptions(it);
        if (help) {
            console.log(it)
        } else {
            startServer(port)
        }
    })
}

main()



/* eslint quotes: [0], strict: [0] */
