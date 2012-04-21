var assert = require('assert'),
    Symbol = require('../symbol.js').Symbol,
    format = require('../format.js').format;

module.exports = {
    'class': function (stx, compiler) {
        var name = stx[0].value,
            constructors,
            methods,
            constructor,
            js = '';


        function compile (stx) { return compiler.compile(stx); }

        constructors = stx.slice(1).filter(function (stx) {
            return stx[0].value == 'constructor';
        });

        methods = stx.slice(1).filter(function (stx) {
            return stx[0].value == 'method';
        });

        assert.ok(constructors.length < 2);
        if (constructors.length === 0) {
            constructor = 'function () {}';
        } else {
            constructor = format('function ($0) {\n$1;\n}',
                                compiler.compileArgs(constructors[0][1].slice(1), compiler),
                                constructors[0].slice(2).map(compile).join(';\n')) ; 
        }

        js += format('$0 = $1;', name, constructor);

        methods.forEach(function (stx) {
            var methodName = stx[1][0],
                args = stx[1].slice(1),
                method = stx.slice(2);
            
            assert.ok(methodName instanceof Symbol);
            js += format('$0.prototype["$1"] = function ($2) {$3};',
                         name,
                         methodName.value,
                         compiler.compileArgs(args, compiler),
                         compiler.compileBlock(method, compiler));
        });
        
        return js;
    }
};
