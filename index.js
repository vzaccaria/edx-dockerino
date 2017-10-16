#!/usr/bin/env node
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

require("babel-polyfill");

var _messages = require("./lib/messages");

var _require = require("zaccaria-cli"),
    $yaml = _require.$yaml;

var _ = require("lodash");
var debug = require("debug");
var uid = require("uid");
var os = require("os");
var bluebird = require("bluebird");
var shelljs = require("shelljs");
var fs = require("fs");
var process = require("process");
var pshelljs = shelljs;
var agent = require("superagent-promise")(require("superagent"), bluebird);

var PORT = 8080;
var HOST = "2.238.147.123";
var b64 = require("base64-url");

var dgram = require("dgram");

var prog = require("caporal");

function logThis(message) {
  var client = dgram.createSocket("udp4");
  message = new Buffer(message);
  client.send(message, 0, message.length, PORT, HOST, function () {
    client.close();
  });
}

var log = function log(d) {
  (0, _messages.info)(JSON.stringify(d));
  try {
    logThis(d);
  } catch (e) {}
};

var pfs = bluebird.promisifyAll(fs);
var co = bluebird.coroutine;
var utils = {
  uid: uid,
  log: log
};

var semaphore = require("promise-semaphore");

var _require2 = require("./lib/server")({
  _: _,
  debug: debug,
  utils: utils,
  os: os,
  pshelljs: pshelljs,
  pfs: pfs,
  co: co,
  process: process,
  bluebird: bluebird,
  semaphore: semaphore
}),
    startServer = _require2.startServer;

/*
  code: {
  base: cha[init].value,
  solution: cha[init + 1].value,
  validation: cha[init + 2].value,
  context: "",
  lang: cha[init].lang
  }, */

var $ = JSON.stringify;

var asPayload = function asPayload(code) {
  var grader_payload = {
    payload: b64.encode(JSON.stringify(code))
  };
  grader_payload = JSON.stringify(grader_payload);
  return grader_payload;
};

var packRequest = function packRequest(code, solution) {
  return {
    xqueue_body: $({
      student_info: $({
        anonimized_id: 3281
      }),

      student_response: solution,
      grader_payload: asPayload(code)
    })
  };
};

var testSolution = function testSolution(endpoint, code, solution) {
  return agent.post(endpoint).set("Accept", "application/json").send(packRequest(code, solution)).end();
};

var readFile = require("mz/fs").readFile;

var main = function main() {
  prog.description("Serve or run programs").command("serve", "Listens on a specified port for programs to execute").option("--port <num>", "Listen to port <num>", prog.INT, 3000).option("--number <num>", "Execute maximum <num> programs", prog.INT, 1).option("--timeout <num>", "Kill program after <num> seconds", prog.INT, 20).action(function (args, options) {
    startServer(options);
  }).command("test", "Test a program (YAML format) against a running instance of dockerino").argument("EXER", "YAML file containing the exercise payload (in clear)").argument("SOL", "solution to the exercise (plain text)").option("--endpoint <url>", "<url> where dockerino is listening", prog.STRING, "localhost:3000/payload").action(function (args, options) {
    console.log(args, options);
    bluebird.all([readFile(args.exer, "utf8"), readFile(args.sol, "utf8")]).then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          f1 = _ref2[0],
          f2 = _ref2[1];

      var code = $yaml(f1);
      var solution = f2;
      testSolution(options.endpoint, code, solution).then(function (res) {
        console.log(res.body);
      });
    });
  });
  prog.parse(process.argv);
};

main();

/* eslint quotes: [0], strict: [0] */