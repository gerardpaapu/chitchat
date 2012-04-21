var classString = require('../runtime/classString.js').classString,
    Symbol = require('./symbol.js').Symbol,
    primitives = require('./primitives/index.js'),
    format = require('./format.js').format,
    assert = require('assert');

var Compiler = function () {};
exports.Compiler = Compiler;
Compiler.prototype.compile = function (stx) {
    switch (classString(stx)) {
        case 'Number':
        case 'String':
            return JSON.stringify(stx);

        case 'Array':
            return this.compileArray(stx);

        default:
            if (stx instanceof Symbol) {
                return stx.toJSSymbol();
            } else {
                throw new SyntaxError('WTF is ' + stx);
            }
    }
};
Compiler.prototype.compileMessage = function (stx) {
    if (stx instanceof Symbol) {
        return JSON.stringify(stx.value);
    }
    
    assert.equal(classString(stx), 'Array');
    assert.equal(stx[0], Symbol.MSG);
    
    return this.compile(stx[1]);
};

Compiler.prototype.compileArray = function (stx) {
    var head = stx[0],
        tail = stx.slice(1),
        args;

    if (head instanceof Symbol &&
        head.value in primitives) {        
        return primitives[head.value](tail, this);        
    } 

    if (tail.length === 0) {
        throw new SyntaxError();
    }

    if (tail.length === 1) { 
        // (obj msg) -> _passMessage(obj, 'msg');
        return format('_passMessage($0, $1)',
                      this.compile(head),
                      this.compileMessage(tail[0]));
    } else {
        // (obj msg arg ...) -> _passMessage(obj, 'msg', [arg, ...]);
        args = tail.slice(1).map(this.compile.bind(this));

        return format('_passMessage($0, $1, [$2])',
                      this.compile(head),
                      this.compileMessage(tail[0]),
                      args.join(', '));
    }
};

Compiler.prototype.compileArgs = function (stx, compiler) {
    return stx.map(function (sym) {
        assert.ok(sym instanceof Symbol);
        return sym.toJSSymbol();
    }).join(', ');
};

Compiler.prototype.compileBlock = function (stx, compiler) {
    var compile, exprs, body, tail, body_string;

    compile = function (stx) {
        return compiler.compile(stx);
    };

    exprs = stx.map(compile);

    body = exprs.slice(0, -1);

    if (body.length > 0) {
        body_string = body.join(';\n') + ';\n';
    } else {
        body_string = '';
    }

    tail = exprs[exprs.length - 1];

    return format('$0return $1;', body_string, tail);
};
