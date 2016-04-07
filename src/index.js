import "babel-polyfill";

import { warn, info } from './messages'

let {
    $d, $o, $f
    // $r.stdin() -> Promise  ;; to read from stdin
} = require('zaccaria-cli')

let getOptions = doc => {
    "use strict"
    let o = $d(doc)
    let help = $o('-h', '--help', false, o)
    let port = $o('-p', '--port', 3000, o);
    return {
        help, port
    }
}

let startServer = (port=3000) => {
    let app = require('koa')();
    let router = require('koa-router')();

    app.use(router.routes())
        .use(router.allowedMethods());

    app.use(router.routes());

    router.get("/", function*() {
        this.response.body = [1, 2, 3, 4, 5];
        this.response.status = 200
    });

    app.listen(port, () => {
        info(`App listening on port ${port}.`);
    });

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
