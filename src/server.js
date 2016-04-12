import {
    warn, info
}
from './messages'
let parse = require('co-body')
let b64 = require('base64-url')

let _module = (modules) => {

    let {
        runPayload, setup, isBusy
    } = require('./payload')(modules)

    let extractPayload = function(req) {
        let xqueueBody = JSON.parse(req.xqueue_body)
        let student_info = JSON.parse(xqueueBody.student_info)
        let student_response = xqueueBody.student_response
        let grader_payload = JSON.parse(b64.decode(JSON.parse(xqueueBody.grader_payload).payload))
        return {
            student_info, student_response, grader_payload
        }
    }

    function generateResponse(resp) {
        if (resp.executed === false || resp.result.code !== 0) {
            return {
                correct: false,
                score: 0,
                message: "Wrong answer!"
            }
        } else {
            return {
                correct: true,
                message: "OK!",
                score: (resp.score) ? resp.score : 1
            }
        }
    }

    function* processRequest() {
        let body = yield parse.json(this.req)
        let payload = extractPayload(body)
        let resp = yield runPayload(payload.grader_payload)
        this.body = generateResponse(resp)
        this.response.status = 200
    }

    let startServer = (port = 3000) => {
        setup()
        let app = require('koa')();
        let router = require('koa-router')();


        app.use(router.routes())
            .use(router.allowedMethods());

        app.use(router.routes());

        router.post("/payload", processRequest);

        router.post("/status", function*() {
            if(isBusy()) {
                this.response.status = 503 // server not available
            } else {
                this.response.status = 204 // ok, but no response
            }
        })

        let server = app.listen(port, () => {
            info(`App listening on port ${port}.`);
        });


        return server;

    }
    return {
        startServer, extractPayload
    }
}

module.exports = _module
