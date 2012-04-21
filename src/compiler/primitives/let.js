var format = require('../format.js').format,
    classString = require('../../runtime/classString.js').classString,
    Symbol = require('../symbol.js').Symbol,
    assert = require('assert');

module.exports = {
    'let': function (stx, compiler) {
        var args = 'typeof arguments != "undefined" ? arguments : []',
            bindings, bindings_js = '', body;

        assert.equal(classString(stx[0]), 'Array');
        assert.equal(stx[0][0], Symbol.BINDINGS);

        bindings = stx[0].slice(1);
        if (bindings.length > 0) {
            bindings_js += 'var ';
            bindings_js += bindings.map(function (b) {
                var val;
                if (b instanceof Symbol) {
                    return b.toJSSymbol();
                } else {
                    assert.equal(classString(b), 'Array');
                    assert.ok(b[0] instanceof Symbol);

                    val = compiler.compile(b[1]);
                    return format('$0 = $1', b[0].toJSSymbol(), val);
                }
            }).join(',\n    ');
            bindings_js += ';';
        }
        return format('(function () {$0$1}.call(this, $2))',
                     bindings_js,
                     compiler.compileBlock(stx.slice(1), compiler),
                     args);
    }
};
