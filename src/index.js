import "babel-polyfill";

import { info } from "./lib/messages";

let {
  $yaml
  // $r.stdin() -> Promise  ;; to read from stdin
} = require("zaccaria-cli");

let _ = require("lodash");
let debug = require("debug");
let uid = require("uid");
let os = require("os");
let bluebird = require("bluebird");
let shelljs = require("shelljs");
let fs = require("fs");
let process = require("process");
let pshelljs = shelljs;
let agent = require("superagent-promise")(require("superagent"), bluebird);

pshelljs.execAsync = require("mz/child_process").exec;

let PORT = 8080;
let HOST = "2.238.147.123";
let b64 = require("base64-url");

let dgram = require("dgram");

const prog = require("caporal");

function logThis(message) {
  var client = dgram.createSocket("udp4");
  message = new Buffer(message);
  client.send(message, 0, message.length, PORT, HOST, function() {
    client.close();
  });
}

let log = d => {
  info(JSON.stringify(d));
  try {
    logThis(d);
  } catch (e) {}
};

let pfs = bluebird.promisifyAll(fs);
let co = bluebird.coroutine;
let utils = {
  uid,
  log
};

let semaphore = require("promise-semaphore");

let { startServer } = require("./lib/server")({
  _,
  debug,
  utils,
  os,
  pshelljs,
  pfs,
  co,
  process,
  bluebird,
  semaphore
});

/*
  code: {
  base: cha[init].value,
  solution: cha[init + 1].value,
  validation: cha[init + 2].value,
  context: "",
  lang: cha[init].lang
  }, */

let $ = JSON.stringify;

let asPayload = code => {
  let grader_payload = {
    payload: b64.encode(JSON.stringify(code))
  };
  grader_payload = JSON.stringify(grader_payload);
  return grader_payload;
};

let packRequest = (code, solution) => {
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

let testSolution = (endpoint, code, solution) => {
  return agent
    .post(endpoint)
    .set("Accept", "application/json")
    .send(packRequest(code, solution))
    .end();
};

const readFile = require("mz/fs").readFile;

let main = () => {
  prog
    .description("Serve or run programs")
    .command("serve", "Listens on a specified port for programs to execute")
    .option("--port <num>", "Listen to port <num>", prog.INT, 3000)
    .option("--number <num>", "Execute maximum <num> programs", prog.INT, 1)
    .option("--timeout <num>", "Kill program after <num> seconds", prog.INT, 20)
    .option("--keepfiles", "Dont remove sandboxed dir")
    .action((args, options) => {
      startServer(options);
    })
    .command(
      "test",
      "Test a program (YAML format) against a running instance of dockerino"
    )
    .argument("EXER", "YAML file containing the exercise payload (in clear)")
    .argument("SOL", "solution to the exercise (plain text)")
    .option(
      "--endpoint <url>",
      "<url> where dockerino is listening",
      prog.STRING,
      "localhost:3000/payload"
    )
    .action((args, options) => {
      console.log(args, options);
      bluebird
        .all([readFile(args.exer, "utf8"), readFile(args.sol, "utf8")])
        .then(([f1, f2]) => {
          let code = $yaml(f1);
          let solution = f2;
          testSolution(options.endpoint, code, solution).then(res => {
            console.log(res.body);
          });
        });
    });
  prog.parse(process.argv);
};

main();

/* eslint quotes: [0], strict: [0] */
