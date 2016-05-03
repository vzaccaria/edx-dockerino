"use strict";

let chai = require('chai');
chai.use(require('chai-as-promised'));
let should = chai.should();
let expect = chai.expect;
let _ = require('lodash');
require('babel-polyfill');

let bluebird = require('bluebird');

let mm = require('mm');
mm.restore();

let ENDPOINT = (!_.isUndefined(process.env.ENDPOINT)) ? process.env.ENDPOINT : 'http://localhost:3000';

let agent = require('superagent-promise')(require('superagent'), bluebird);

let debug = require('debug');
let uid = require('uid');
let os = require('os');
let shelljs = require('shelljs');
let fs = require('fs');

let pshelljs = shelljs;
let pfs = bluebird.promisifyAll(fs);
let co = bluebird.coroutine;
let semaphore = require('promise-semaphore');


/**
 * Promised version of shelljs exec
 * @param  {string} cmd The command to be executed
 * @return {promise}     A promise for the command output
 */

/*global describe, it, before, beforeEach, after, afterEach */

let payload = {
    code: {
        lang: 'octave',
        context: '',
        validation: 'assert(a==1)'
    },
    response: "a=1"
};

let $ = (it) => JSON.stringify(it, 0, 4)
let b64 = require('base64-url');

let packet = (anonimized_id, response, payload) => {
    return {
        xqueue_body: $({

            student_info: $({
                anonimized_id
            }),

            student_response: response,

            grader_payload: $({
                payload: b64.encode($(payload))
            })
        })
    };
};

let utils = {
    uid
}

describe('#server (API)', () => {
        let server = require('./server')({
            _, debug, utils, os, pshelljs, pfs, co, process, bluebird, semaphore
        });

    let app;
        before(() => {
            app = server.startServer({port: 3000});
        });

    it('API call should report success on a good program', () => {
        let examplePacket = packet(237, "a = 1", payload);
        //console.log(`curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(examplePacket)}' http://localhost:3000/payload`);
        return agent.post(`${ENDPOINT}/payload`).set('Accept', 'application/json').send(examplePacket).end().then((resp) => {
            expect(resp.body).to.contain({
                correct: true,
                score: 1
            });
        });
    });
    it('API call should report a failed assertion', () => {
        let examplePacket = packet(237, "a = 2", payload);
        //console.log(`curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(examplePacket)}' http://localhost:3000/payload`);
        return agent.post(`${ENDPOINT}/payload`).set('Accept', 'application/json').send(examplePacket).end().then((resp) => {
            expect(resp.body).to.contain({
                correct: false,
                score: 0
            });
        });
    });
    it('API should timeout on a long program', () => {
        let examplePacket = packet(237, "sleep(10); a=1", payload);
        //console.log(`curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(examplePacket)}' http://localhost:3000/payload`);
        return agent.post(`${ENDPOINT}/payload`).set('Accept', 'application/json').send(examplePacket).end().then((resp) => {
            expect(resp.body).to.contain({
                correct: false,
                score: 0
            });
        });
    });
    after(() => {
        app.close();
    });
});
