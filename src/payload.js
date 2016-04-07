let _module = ({_, debug, uid, os, bluebird, shelljs}) => {
    if(_.any([debug, uid, os, bluebird, shelljs], _.isUndefined)) {
        return undefined
    }
    return {

        runPayload: (payload) => {
            return true
        },

        testOctave: () => {
            if(shelljs.test('-e', '/usr/bin/octave') || shelljs.test('-e', '/usr/local/bin/octave')) {
                return true
            } else {
                return false
            }
        }
    }
}

module.exports = _module
