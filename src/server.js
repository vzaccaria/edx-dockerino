import {
    warn, info
}
from './messages';
let parse = require('co-body');
let b64 = require('base64-url');

let _module = (modules) => {

    let {
        runPayload, setup
    } = require('./payload')(modules);

    let { _, semaphore, co, debug } = modules;

    debug = debug(__filename);

    let sem = {};
    let _timeout;

    let extractPayload = function(req) {
        let xqueueBody = JSON.parse(req.xqueue_body);
        debug(xqueueBody);
        let student_info = JSON.parse(xqueueBody.student_info);
        let student_response = xqueueBody.student_response;
        let grader_payload = JSON.parse(b64.decode(JSON.parse(xqueueBody.grader_payload).payload));
        return {
            student_info, student_response, grader_payload
        };
    };

    function generateResponse(resp) {
        if (resp.executed === false || resp.result.code !== 0) {
            return {
                correct: false,
                score: 0,
                msg: "Wrong answer!"
            };
        } else {
            return {
                correct: true,
                msg: "OK!",
                score: (resp.score) ? resp.score : 1
            };
        }
    }

    // Koa supports promises, so we can return a promise to it
    function gatedProcessRequest() {
        return sem.add(co(processRequest).bind(this));
    }  

    function* processRequest() {
        let body = yield parse.json(this.req);
        let payload = extractPayload(body);
        debug("Received ", payload);
        let resp = yield runPayload(payload.grader_payload, payload.student_response, {_timeout});
        this.body = generateResponse(resp);
        this.response.status = 200;
    }

    let startServer = ({port, number, timeout}) => {
        _timeout = timeout || 1.0;
        if(_.isUndefined(port)) {
            port = 3000; 
        }
        if(_.isUndefined(number)) {
            number = 1;
        }
        setup();
        let app = require('koa')();
        let router = require('koa-router')();
        sem = new semaphore({ rooms: number });

        app.use(router.routes())
           .use(router.allowedMethods());

        app.use(router.routes());

        router.post("/payload", gatedProcessRequest);

        router.post("/status", function*() {
            this.response.status = 204 ;// ok, but no response
        });

        let server = app.listen(port, () => {
            info(`App listening on port ${port}.`);
            info(`serving ${number} concurrent requests.`);
            info(`using ${_timeout} seconds as timeout`);
            debug("Debug mode activated.");
        });


        return server;

    };
    return {
        startServer, extractPayload
    };
}

module.exports = _module
