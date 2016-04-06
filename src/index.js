import "babel-polyfill";

var app = require('koa')();
var router = require('koa-router')();

app .use(router.routes())
    .use(router.allowedMethods());

app.use(router.routes());

router.get("/", function*() {
    this.response.body = [1, 2, 3, 4, 5];
    this.response.status = 200
});

app.listen(3000, () => {
    console.log("App listening on port 3000.");
});


/* eslint quotes: [0], strict: [0] */
// var {
//     $d, $o, $f
//     // $r.stdin() -> Promise  ;; to read from stdin
// } = require('zaccaria-cli')
//
// var getOptions = doc => {
//     "use strict"
//     var o = $d(doc)
//     var help = $o('-h', '--help', false, o)
//     return {
//         help
//     }
// }
//
// var main = () => {
//     $f.readLocal('docs/usage.md').then(it => {
//         var {
//             help
//         } = getOptions(it);
//         if (help) {
//             console.log(it)
//         }
//     })
// }
//
// main()
