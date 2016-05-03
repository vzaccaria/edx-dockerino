function createScript({
    code
}, student_response) {

    let {
        validation,
        context
    } = code;

    return `
    ${context}
    ${student_response}
    ${validation}
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

    if (_.any([co, debug, utils, os, pshelljs, pfs, process, bluebird], _.isUndefined)) {
        return undefined;
    }

    function createCommand(cmd, config) {
        return `${timeoutCommand} --kill-after=${config._timeout}s --signal=9 ${config._timeout}s ${cmd}`;
    }

    let execAsync = (cmd, config) => {

        return new bluebird((resolve) => {
            pshelljs.exec(createCommand(cmd, config), {
                async: true,
                silent: true
            }, (code, stdout) => {
                resolve({
                    code,
                    stdout
                });
            });
        });
    };


    return {

        runPayload: co(function*(payload, student_response, config) {
            if (payload.code.lang !== 'octave') {
                throw "language not supported";
            }
            let tmpdir = os.tmpdir();
            let tuid = utils.uid();
            let sandboxdir = `${tmpdir}/${tuid}`;
            pshelljs.mkdir('-p', sandboxdir);
            try {
                let script = createScript(payload, student_response);
                yield pfs.writeFileAsync(`${sandboxdir}/script.m`, script, 'utf8');
                process.cwd(sandboxdir);
                let r = yield execAsync(`${octaveCommand} --silent ${sandboxdir}/script.m`, config);
                pshelljs.rm('-rf', sandboxdir);
                return {
                    executed: true,
                    result: r
                };
            } catch (e) {
                pshelljs.rm('-rf', sandboxdir);
                return {
                    executed: false
                };
            }
        }),

        setup: () => {
            if (pshelljs.test('-e', '/usr/bin/octave')) {
                octaveCommand = '/usr/bin/octave';
            } else if (pshelljs.test('-e', '/usr/local/bin/octave')) {
                octaveCommand = '/usr/local/bin/octave';
            } else {
                throw "cannot find octave";
            }
            if (pshelljs.test('-e', '/usr/local/bin/gtimeout')) {
                timeoutCommand = '/usr/local/bin/gtimeout';
            } else if (pshelljs.test('-e', '/usr/bin/timeout')) {
                timeoutCommand = '/usr/bin/timeout';
            } else {
                throw "cannot find timeout command";
            }
        }
    };
};

module.exports = _module;
