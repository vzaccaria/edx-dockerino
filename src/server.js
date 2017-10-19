import { info, error } from "./messages";
let parse = require("co-body");
let b64 = require("base64-url");

let _module = modules => {
  let { runPayload, setup } = require("./payload")(modules);

  let { semaphore, co, debug } = modules;

  debug = debug(__filename);

  let sem = {};
  let _timeout;
  let _keepfiles = false;

  let extractPayload = function(req) {
    let xqueueBody = JSON.parse(req.xqueue_body);
    debug(xqueueBody);
    let student_info = JSON.parse(xqueueBody.student_info);
    let student_response = xqueueBody.student_response;
    let grader_payload = JSON.parse(
      b64.decode(JSON.parse(xqueueBody.grader_payload).payload)
    );
    return {
      student_info,
      student_response,
      grader_payload
    };
  };

  function generateResponse(resp) {
    if (resp.executed === false) {
      return {
        correct: false,
        score: 0,
        msg: "Non sono riuscito ad eseguire in maniera sicura il programma. Contattare il docente e segnalare il problema"
      };
    } else {
      let result = { correct: false, score: 0 };
      switch (resp.result.code) {
        case 0:
          result = {
            correct: true,
            score: 1,
            msg: "Esercizio svolto correttamente, complimenti!"
          };
          break;
        case 1:
          result.msg = "Il programma presenta errori di sintassi o un utilizzo sbagliato delle funzioni Matlab. Si prega di ricontrollarlo nell'ambiente Matlab locale.";
          break;
        case 2:
          result.msg = " Il programma è corretto dal punto di vista sintattico ma non calcola il risultato in modo corretto.";
          break;
        default:
          result.msg = "Si è verificato un errore sconosciuto. Contattare il docente con allegando il programma scritto.";
      }
      return result;
    }
  }

  // Koa supports promises, so we can return a promise to it
  function gatedProcessRequest() {
    return sem.add(co(processRequest).bind(this));
  }

  function* processRequest() {
    try {
      let body = yield parse.json(this.req);
      let payload = extractPayload(body);
      debug("Received ", payload);
      let resp = yield runPayload(
        payload.grader_payload,
        payload.student_response,
        {
          _timeout,
          _keepfiles
        }
      );
      debug(resp);
      this.body = generateResponse(resp);
      this.response.status = 200;
    } catch (e) {
      error(e);
      this.body = {
        correct: false,
        score: 0,
        msg: e
      };
      this.response.status = 200;
    }
  }

  let startServer = ({ port, number, timeout, keepfiles }) => {
    _timeout = timeout;
    _keepfiles = keepfiles;
    setup();
    let app = require("koa")();
    let router = require("koa-router")();
    sem = new semaphore({
      rooms: number
    });

    app.use(router.routes()).use(router.allowedMethods());

    app.use(router.routes());

    router.post("/payload", gatedProcessRequest);

    router.post("/status", function*() {
      this.response.status = 204; // ok, but no response
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
    startServer,
    extractPayload
  };
};

module.exports = _module;
