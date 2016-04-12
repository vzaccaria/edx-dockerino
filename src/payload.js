function createScript({
    code, response
}) {
    let {
        validation, context
    } = code
    return `
    ${context}
    ${response}
    ${validation}
    `
}

let _module = ({
    co, _, debug, utils, os, pshelljs, pfs, process, bluebird
}) => {
    let octaveCommand = undefined
    let _isBusy = false

    if (_.any([co, debug, utils, os, pshelljs, pfs, process, bluebird], _.isUndefined)) {
        return undefined
    }

    let execAsync = (cmd) => {
        return new bluebird((resolve) => {
            pshelljs.exec(cmd, {async: true}, (code, stdout) => {
                resolve({code, stdout})
            })
        })
    }


    return {

        isBusy: function() {
            return _isBusy
        },

        runPayload: co(function*(payload) {
            _isBusy = true
            if (payload.code.lang !== 'octave') {
                _isBusy = false
                throw "language not supported";
            }
            let tmpdir = os.tmpdir()
            let tuid = utils.uid()
            let sandboxdir = pshelljs.mkdir('-p', `${tmpdir}/${tuid}`)
            try {
                let script = createScript(payload)
                yield pfs.writeFileAsync(`${sandboxdir}/script.m`, script, 'utf8')
                process.cwd(sandboxdir)
                let r = yield execAsync(`${octaveCommand} --silent ${sandboxdir}/script.m`);
                pshelljs.rmdir('-f', sandboxdir);
                _isBusy = false
                return {
                    executed: true,
                    result: r
                };
            } catch (e) {
                pshelljs.rmdir('-f', sandboxdir);
                _isBusy = false
                return {
                    executed: false
                };
            }
        }),

        setup: () => {
            if (pshelljs.test('-e', '/usr/bin/octave')) {
                octaveCommand = '/usr/bin/octave'
            } else if (pshelljs.test('-e', '/usr/local/bin/octave')) {
                octaveCommand = '/usr/local/bin/octave'
            } else {
                throw "cannot find octave"
            }
        }
    }
}
module.exports = _module
