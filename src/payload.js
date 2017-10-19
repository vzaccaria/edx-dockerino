let _string = require("string");
let _deh = s => _string(s).decodeHTMLEntities().s;

function createScript(code, student_response) {
  let { validation, context } = code;

  return `
    ${_deh(context)}
    ${_deh(student_response)}
    ${_deh(validation)}
    `;
}

let _module = ({
  co,
  _,
  debug,
  utils,
  os,
  pshelljs,
  pfs,
  process,
  bluebird
}) => {
  let octaveCommand = undefined;
  let timeoutCommand = undefined;

  if (
    _.any(
      [co, debug, utils, os, pshelljs, pfs, process, bluebird],
      _.isUndefined
    )
  ) {
    return undefined;
  }

  function createCommand(cmd, config) {
    return `${timeoutCommand} --kill-after=${config._timeout}s --signal=9 ${config._timeout}s ${cmd}`;
  }

  let execAsync = (cmd, config) => {
    let actualCommand = createCommand(cmd, config);
    debug(actualCommand);
    return pshelljs.execAsync(actualCommand).then(
      ([stdout, stderr]) => {
        return {
          code: 0,
          stdout,
          stderr
        };
      },
      error => {
        console.log(JSON.stringify(error, 0, 4));
        return {
          code: 1,
          stderr: error.signal
        };
      }
    );
  };

  let { log } = utils;

  function getLogMsg(responseTime) {
    let nano = responseTime[1];
    let secs = responseTime[0];
    responseTime = secs * 1000 + nano / 1000000;
    return `executionTime: ${responseTime}`;
  }

  debug = debug(__filename);

  return {
    runPayload: co(function*(payload, student_response, config) {
      if (
        _.isUndefined(payload.lang) ||
        (payload.lang !== "octave" && payload.lang !== "matlab")
      ) {
        throw "language not supported";
      }
      let tmpdir = os.tmpdir();
      let tuid = utils.uid();
      let sandboxdir = `${tmpdir}/${tuid}`;
      let { _keepfiles } = config;
      pshelljs.mkdir("-p", sandboxdir);
      try {
        let script = createScript(payload, student_response);
        debug(script);
        yield pfs.writeFileAsync(`${sandboxdir}/script.m`, script, "utf8");
        process.cwd(sandboxdir);

        let startTime = process.hrtime();

        let cliCommand = `${octaveCommand} --silent ${sandboxdir}/script.m`;

        debug(cliCommand);
        let r = yield execAsync(cliCommand, config);
        debug(r);
        let timeDiff = process.hrtime(startTime);

        if (!_keepfiles) {
          pshelljs.rm("-rf", sandboxdir);
        }
        log(getLogMsg(timeDiff));
        return {
          executed: true,
          result: r
        };
      } catch (e) {
        if (!_keepfiles) {
          pshelljs.rm("-rf", sandboxdir);
        }
        return {
          executed: false
        };
      }
    }),

    setup: () => {
      if (pshelljs.test("-e", "/usr/bin/octave-cli")) {
        octaveCommand = "/usr/bin/octave-cli";
      } else if (pshelljs.test("-e", "/usr/local/bin/octave-cli")) {
        octaveCommand = "/usr/local/bin/octave-cli";
      } else {
        throw "cannot find octave";
      }
      if (pshelljs.test("-e", "/usr/local/bin/gtimeout")) {
        timeoutCommand = "/usr/local/bin/gtimeout";
      } else if (pshelljs.test("-e", "/usr/bin/timeout")) {
        timeoutCommand = "/usr/bin/timeout";
      } else {
        throw "cannot find timeout command";
      }
    }
  };
};

module.exports = _module;
