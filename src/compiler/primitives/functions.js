var format = require('../format.js').format,
    classString = require('../../runtime/classString.js').classString,
    Symbol = require('../symbol.js').Symbol,
    JSFunctionEmitter = require('../emitter.js').JSFunctionEmitter,
    JSSymbolEmitter = require('../emitter.js').JSSymbolEmitter,
    JSIIFEEmitter = require('../emitter.js').JSIIFEEmitter,
    assert = require('assert');


module.exports = {
    'function': function (arr) {
        var bindings, args, bodyStx, resultStx, body, result;

        assert.ok(arr.length >= 1);

        bindings = arr[0];
        bodyStx = arr.slice(1, -1);
        resultStx = arr[arr.length - 1];

        assert.equal(bindings.type, 'Array');
        assert.equal(bindings.value[0].type, 'Symbol');
        assert.equal(bindings.value[0].value, '#BINDINGS');

        args = this.compileSymbols(bindings.value.slice(1));

        body = bodyStx.map(function (stx) {
            return this.compile(stx);
        }, this);

        result = this.compile(resultStx);

        return new JSFunctionEmitter(args, body, result);
    },

    '#BLOCK': function (arr) {
        return new JSIIFEEmitter(arr.map(function (stx) { 
            this.compile(stx);
        }, this)); 
    }
};
