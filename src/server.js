import { warn, info } from './messages'

let parse = require('co-body')
let b64 = require('base64-url')

let parseRequest = function*() {
    return yield parse.json(this.req)
}

let extractPayload = function(req) {
    let xqueueBody = JSON.parse(req.xqueue_body)
    let student_info = JSON.parse(xqueueBody.student_info)
    let student_response = xqueueBody.student_response
    let grader_payload = JSON.parse(b64.decode(JSON.parse(xqueueBody.grader_payload).payload))
    return { student_info, student_response, grader_payload }
}

let startServer = (port=3000) => {
    let app = require('koa')();
    let router = require('koa-router')();


    app.use(router.routes())
        .use(router.allowedMethods());

    app.use(router.routes());

    router.post("/payload", function*() {
        this.response.body = [1, 2, 3, 4, 5];
        this.response.status = 200
    });

    app.listen(port, () => {
        info(`App listening on port ${port}.`);
    });

}

module.exports = { startServer, extractPayload }
