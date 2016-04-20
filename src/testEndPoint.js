"use strict"

let chai = require('chai')
chai.use(require('chai-as-promised'))
let should = chai.should()
let expect = chai.expect
require('babel-polyfill')

let bluebird = require('bluebird')

let mm = require('mm')
mm.restore()

let agent = require('superagent-promise')(require('superagent'), bluebird);


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
}

let $ = (it) => JSON.stringify(it, 0, 4)
let b64 = require('base64-url')

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
    }
}

describe('#server (API)', () => {

    let examplePacket = packet(237, "Spooky answer", payload);
    it('API call should trigger program execution', () => {
        // console.log(`curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(examplePacket)}' http://localhost:3000/payload`)
        return agent.post('http://localhost:3000/payload').set('Accept', 'application/json').send(examplePacket).end().then((resp) => {
            expect(resp.body).to.contain({
                correct: true,
                score: 1
            })
        })
    })
})
