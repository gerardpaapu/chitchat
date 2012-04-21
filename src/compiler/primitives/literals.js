var format = require('../format.js').format,
    Symbol = require('../symbol.js').Symbol,
    assert = require('assert');

module.exports = {
    // Array literals 
    '#ARRAY': function (stx, compiler) {
        var compile, body;

        compile = function (stx) {
            return compiler.compile(stx);
        };

        body = stx[0].map(compile);

        return '[' + body.join(', ') + ']';
    },

    // Dictionary literals
    '#DICT': function (stx, compiler) {
        var args = [].slice.call(arguments),
            max = args.length,
            pairs = [],
            i;

        if (max % 2 !== 0) throw new SyntaxError(); 

        for (i = 0; i < max; i += 2) {
            assert.ok(args[i] instanceof Symbol);
            pairs.push(format('"$0": $1',
                              args[i].value,
                              compiler.compile(args[i + 1])));
        }

        return format('{$0}', pairs.join(', '));
    },

    // Positional Argument Literals
    '#ARGS': function (stx, compiler) {
        // e.g. (#ARGS 2) -> arguments[2]
        assert.equal(stx.length, 1);
        return format('arguments[$0]', stx[0]); 
    }
};
