var format = require('../format.js').format,
    classString = require('../../runtime/classString.js').classString,
    Symbol = require('../symbol.js').Symbol,
    assert = require('assert');


module.exports = {
    'function': function (stx, compiler) {
        var args, body;

        args = stx[0].slice(1);   
        body = stx.slice(1);

        assert.equal(classString(args), 'Array');
        assert.equal(stx[0][0], Symbol.BINDINGS);

        return format('function ($0) {$1}',
                      compiler.compileArgs(args, compiler),
                      compiler.compileBlock(body, compiler));
    },

    '#BLOCK': function (stx, compiler) {
        var template = [
            '(function () {',
            '$0',
            '}.call(this, typeof arguments != "undefined" ? arguments : [])'
        ].join('');

        return format(template, compiler.compileBlock(stx, compiler));
    }
};
