"use strict"

let chai = require('chai')
chai.use(require('chai-as-promised'))
let should = chai.should()
let expect = chai.expect
let _ = require('lodash')
require('babel-polyfill')


let debug = require('debug')
let uid = require('uid')
let os = require('os')
let bluebird = require('bluebird')
let shelljs = require('shelljs')
let fs = require('fs')
let mm = require('mm')

let pshelljs = shelljs;
let pfs = bluebird.promisifyAll(fs)
let co = bluebird.coroutine

/**
 * Promised version of shelljs exec
 * @param  {string} cmd The command to be executed
 * @return {promise}     A promise for the command output
 */

let utils = {
    uid
}

/*global describe, it, before, beforeEach, after, afterEach */

let _module = require('./payload');
_module = _module({
    _, debug, utils, os, pshelljs, pfs, co, process, bluebird
})

describe('#payload module', () => {
    it("Should load module", () => {
        return expect(_module).to.not.be.undefined;
    })
    it("Should export `runPayload`", () => {
        return expect(_module.runPayload).to.not.be.undefined;
    })
    it("Should export `setup`", () => {
        return expect(_module.setup).to.not.be.undefined;
    })
})

let payload = {
    code: {
        lang: 'octave',
        context: '-- no context',
        validation: 'assert(a==1)'
    },
    response: "a = 1"
}

describe('#runPayload', () => {
    let record = {}
    mm(utils, 'uid', () => 1)
    mm(os, 'tmpdir', () => "/tmp/bar")
    mm(pshelljs, 'mkdir', (x, y) => record.dirCreated = y)
    mm(pshelljs, 'rmdir', (x, y) => record.dirRemoved = y)
    mm(pshelljs, 'test', () => true)
    mm(process, 'cwd', (y) => record.changedDir = y)
    mm(pfs, 'writeFile', (f, d, o, cb) => {
        record.fileWritten = f, record.dataWritten = d;
        cb(0)
    })
    _module.setup()

    it('Should create sandbox and execute a script in it', () => {
        record = {}
        mm(pshelljs, 'exec', (c, opts, cb) => {
            record.commandExecuted = c;
            cb(33, 'ok')
        })
        return _module.runPayload(payload).then((v) => {
            expect(record).to.contain({
                commandExecuted: "/usr/bin/octave --silent /tmp/bar/1/script.m"
            })
            expect(v).to.deep.equal({
                executed: true,
                result: {
                    code: 33,
                    stdout: 'ok'
                }
            })
        }).should.eventually.be.fulfilled
    })

    it('Should remove sandbox when exec fails', () => {
        record = {}
        mm(pshelljs, 'exec', (c, opts, cb) => {
            throw "Ai!"
        })
        return _module.runPayload(payload).then((v) => {
            expect(record).to.not.contain({
                commandExecuted: "/usr/bin/octave --silent /tmp/bar/1/script.m"
            })
            expect(record).to.contain({
                dirRemoved: '/tmp/bar/1'
            })
            expect(v).to.deep.equal({
                executed: false
            })

        }).should.eventually.be.fulfilled
    })

})

describe('#octave', () => {
    mm(pshelljs, 'test', () => true)
    it("Should detect octave", () => {
        expect(_module.setup()).to.not.throw
    })
})
