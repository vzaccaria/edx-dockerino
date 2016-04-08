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
    co, _, debug, utils, os, pshelljs, pfs, process
}) => {
    let octaveCommand = undefined
    if (_.any([co, debug, utils, os, pshelljs, pfs, process], _.isUndefined)) {
        return undefined
    }
    return {

        runPayload: co(function*(payload) {
            if (payload.code.lang !== 'octave') {
                throw "language not supported";
            }
            let tmpdir = os.tmpdir()
            let tuid = utils.uid()
            let sandboxdir = pshelljs.mkdir('-p', `${tmpdir}/${tuid}`)
            try {
                let script = createScript(payload)
                yield pfs.writeFileAsync(`${sandboxdir}/script.m`, script, 'utf8')
                process.cwd(sandboxdir)
                yield pshelljs.execAsync(`${octaveCommand} --silent ${sandboxdir}/script.m`);
                return true;
            } catch (e) {
                pshelljs.rmdir('-f', sandboxdir);
                throw (e)
            }
            pshelljs.rmdir('-f', sandboxdir);
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
