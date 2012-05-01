var JSOrEmitter = require('../emitter.js').JSOrEmitter,
    JSAndEmitter = require('../emitter.js').JSAndEmitter;

module.exports = {
    'or': function (stx) {
        return new JSOrEmitter(this.compileExpressions(stx));
    },

    'and': function (stx) {
        return new JSAndEmitter(this.compileExpressions(stx));
    }
};
