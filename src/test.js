"use strict";

let chai = require('chai');
chai.use(require('chai-as-promised'));
let should = chai.should();
let expect = chai.expect;
let _ = require('lodash');
require('babel-polyfill');


let debug = require('debug');
let uid = require('uid');
let os = require('os');
let bluebird = require('bluebird');
let shelljs = require('shelljs');
let fs = require('fs');

let mm = require('mm');
mm.restore();

let pshelljs = shelljs;
let pfs = bluebird.promisifyAll(fs);
let co = bluebird.coroutine;
let semaphore = require('promise-semaphore');

let agent = require('superagent-promise')(require('superagent'), bluebird);


/**
 * Promised version of shelljs exec
 * @param  {string} cmd The command to be executed
 * @return {promise}     A promise for the command output
 */

let log = () => {};

let utils = {
    uid,
    log
};

/*global describe, it, before, after*/

let _module = require('./payload');
_module = _module({
    _, debug, utils, os, pshelljs, pfs, co, process, bluebird
});

describe('#payload module', () => {
    it("Should load module", () => {
        return expect(_module).to.not.be.undefined;
    });
    it("Should export `runPayload`", () => {
        return expect(_module.runPayload).to.not.be.undefined;
    });
    it("Should export `setup`", () => {
        return expect(_module.setup).to.not.be.undefined;
    });
});

let payload = {
    lang: 'octave',
    context: '-- no context',
    validation: 'assert(a==1)'
}

let wrongpayload= {
    lang: 'quiz',
    context: '-- no context',
    validation: 'assert(a==1)'
}

let record = {};

function mockModulesForGood(fail) {
    record = {};
    mm.restore();
    mm(utils, 'uid', () => 1);
    mm(os, 'tmpdir', () => "/tmp/bar");
    mm(pshelljs, 'mkdir', (x, y) => { record.dirCreated = y; });
    mm(pshelljs, 'rm', (x, y) => { record.dirRemoved = y; });
    mm(pshelljs, 'test', (o, f) => (f === '/usr/bin/octave' || f === '/usr/bin/timeout') ? true : false);
    mm(process, 'cwd', (y) => record.changedDir = y);
    mm(pfs, 'writeFile', (f, d, o, cb) => {
        record.fileWritten = f, record.dataWritten = d;
        cb(0);
    });
    if (!fail) {
        mm(pshelljs, 'exec', (c, opts, cb) => {
            record.commandExecuted = c;
            cb(0, 'ok');
        });
    } else {
        mm(pshelljs, 'exec', (c, opts, cb) => {
            throw "Ai!";
        });
    }
}

function mockRestore() {
    mm.restore();
}


describe('#runPayload (mocked deps)', () => {
    it('Should create sandbox, execute a script in it and return exit code', () => {
        mockModulesForGood(false);
        _module.setup();
        return _module.runPayload(payload, {}, {_timeout: 1}).then((v) => {
            expect(record).to.contain({
                commandExecuted: "/usr/bin/timeout --kill-after=1s --signal=9 1s /usr/bin/octave --silent /tmp/bar/1/script.m"
            });
            expect(v).to.deep.equal({
                executed: true,
                result: {
                    code: 0,
                    stdout: 'ok'
                }
            });
        });
    });

    it('Should remove sandbox when exec fails', () => {
        mockModulesForGood(true);
        return _module.runPayload(payload, 'a=1').then((v) => {
            expect(record).to.not.contain({
                commandExecuted: "/usr/bin/octave --silent /tmp/bar/1/script.m"
            });
            expect(record).to.contain({
                dirRemoved: '/tmp/bar/1'
            });
            expect(v).to.deep.equal({
                executed: false
            });

        }).should.be.fulfilled;
    });

});

let $ = (it) => JSON.stringify(it, 0, 4);
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

describe('#server (mocked deps)', () => {
    let server = require('./server')({
        _, debug, utils, os, pshelljs, pfs, co, process, bluebird, semaphore
    });
    let examplePacket = packet(237, "Spooky answer", payload);
    it('Should export startServer', () => {
        return expect(server.startServer).to.exist;
    });
    it('Should export extractPayload', () => {
        return expect(server.extractPayload).to.exist;
    });
    it('extractPayload should decode a xqueue body correctly', () => {
        let inf = server.extractPayload(examplePacket);
        expect(inf.student_info).to.be.deep.equal({
            anonimized_id: 237
        });
        expect(inf.grader_payload).to.be.deep.equal(payload); 

    });
});

describe('#server (API)', () => {
    mm.restore();
    let server = require('./server')({
        _, debug, utils, os, pshelljs, pfs, co, process, bluebird, semaphore
    });

    let examplePacket = packet(237, "a = 2", payload);
    let wrongPacket = packet(237, "a = 1", wrongpayload);
    let app;
    before(() => {
        app = server.startServer({port: 4000});
    });
    it('API call should trigger program execution', () => {
        mockModulesForGood(false);
        return agent.post('http://localhost:4000/payload').set('Accept', 'application/json').send(examplePacket).end().then((resp) => {
            expect(record).to.be.deep.equal({
                dirCreated: '/tmp/bar/1',
                dirRemoved: '/tmp/bar/1',
                fileWritten: '/tmp/bar/1/script.m',
                dataWritten: '\n    -- no context\n    a = 2\n    assert(a==1)\n    ',
                changedDir: '/tmp/bar/1',
                commandExecuted: '/usr/bin/timeout --kill-after=1s --signal=9 1s /usr/bin/octave --silent /tmp/bar/1/script.m'
            });
            expect(resp.body).to.contain({
                correct: true,
                score: 1,
                msg: "OK!"
            });
        });
    });
    it('API call should trigger program execution - program fails', () => {
        mockModulesForGood(true);
        return agent.post('http://localhost:4000/payload').set('Accept', 'application/json').send(examplePacket).end().then((resp) => {
            expect(record).to.be.deep.equal({
                dirCreated: '/tmp/bar/1',
                fileWritten: '/tmp/bar/1/script.m',
                dataWritten: '\n    -- no context\n    a = 2\n    assert(a==1)\n    ',
                changedDir: '/tmp/bar/1',
                dirRemoved: '/tmp/bar/1'
            });
            expect(resp.body).to.contain({
                correct: false,
                score: 0,
                msg: "Wrong answer!"
            });
        });
    });
    it('API call should trigger program execution - program generates run payload exception', () => {
        mockModulesForGood(true);
        return agent.post('http://localhost:4000/payload').set('Accept', 'application/json').send(wrongPacket).end().then((resp) => {
            expect(resp.body).to.contain({
                correct: false,
                score: 0,
                msg: "language not supported"
            });
        });
    });
    it('API should expose status', () => {
        mockModulesForGood(false);
        return agent.post('http://localhost:4000/status').end().then((resp) => {
            return expect(resp.status).to.be.equal(204);
        });
    });

    after(() => {
        app.close();
    });
});

describe('#test shutdown', () => {
    after( () => {
        mockRestore();
    });
});
