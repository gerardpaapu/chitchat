var Symbol = require('../symbol.js').Symbol,
    JSArrayEmitter = require('../emitter.js').JSArrayEmitter,
    JSDictionaryEmitter = require('../emitter.js').JSDictionaryEmitter,
    JSAccessorEmitter = require('../emitter.js').JSAccessorEmitter,
    JSKeywordEmitter = require('../emitter.js').JSKeywordEmitter,
    JSNumberEmitter = require('../emitter.js').JSNumberEmitter,
    assert = require('assert');

module.exports = {
    // Array literals 
    '#ARRAY': function (arr) {
        var body = this.compileExpressions(arr[0].value);
        return new JSArrayEmitter(body);
    },

    // Dictionary literals
    '#DICT': function (arr) {
        var args = arr[0],
            max = args.length,
            result = {},
            i;

        if (max % 2 !== 0) throw new SyntaxError(); 

        for (i = 0; i < max; i += 2) {
            assert.ok(args[i].type == 'Symbol' ||
                      args[i].type == 'String');

            result[args[i].value] = this.compile(args[i + 1]);
        }

        return new JSDictionaryEmitter(result);
    },

    // Positional Argument Literals
    '#ARGS': function (arr) {
        // e.g. (#ARGS 2) -> arguments[2]
        assert.equal(arr.length, 1);
        return new JSAccessorEmitter(new JSKeywordEmitter('arguments'),
                                     new JSNumberEmitter(arr[0].value)); 
    }
};
