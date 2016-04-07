"use strict"

let chai = require('chai')
chai.use(require('chai-as-promised'))
let should = chai.should()
let expect = chai.expect
let _ = require('lodash')


import debug from 'debug'
import uid from 'uid'
import os from 'os'
import bluebird from 'bluebird'
import shelljs from 'shelljs'

/**
 * Promised version of shelljs exec
 * @param  {string} cmd The command to be executed
 * @return {promise}     A promise for the command output
 */

/*global describe, it, before, beforeEach, after, afterEach */

describe('#payload', () => {
    let _module = require('./payload');
    _module = _module({_, debug, uid, os, bluebird, shelljs} )
    it("Should load module", () => {
        return expect(_module).to.not.be.undefined;
    })
    it("Should export `runPayload`", () => {
        return expect(_module.runPayload).to.not.be.undefined;
    })
    it("Should export `testOctave`", () => {
        return expect(_module.testOctave).to.not.be.undefined;
    })
})

describe('#octave', () => {
    let _module = require('./payload');
    _module = _module({_, debug, uid, os, bluebird, shelljs} )
    it("Should detect octave", () => {
        expect(_module.testOctave()).to.be.true
    })
})
