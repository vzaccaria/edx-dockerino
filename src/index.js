import "babel-polyfill";

import { warn, info } from './messages'

let {
    $d, $o, $f
    // $r.stdin() -> Promise  ;; to read from stdin
} = require('zaccaria-cli')

import { startServer } from './server'

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
