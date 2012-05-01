var classString = require('../runtime/classString.js').classString,
    Symbol = require('./symbol.js').Symbol,
    primitives = require('./primitives/index.js'),
    Syntax = require('./syntax.js').Syntax,

    assert = require('assert'),
    JSKeywordEmitter = require('./emitter.js').JSKeywordEmitter,
    JSNumberEmitter = require('./emitter.js').JSNumberEmitter,
    JSStringEmitter = require('./emitter.js').JSStringEmitter,
    JSSymbolEmitter = require('./emitter.js').JSSymbolEmitter,
    JSArrayEmitter = require('./emitter.js').JSArrayEmitter,
    JSSequenceEmitter = require('./emitter.js').JSSequenceEmitter,
    JSFunctionCallEmitter = require('./emitter.js').JSFunctionCallEmitter;

var Compiler = function () {
};
exports.Compiler = Compiler;
// A Compiler transforms Syntax objects to JSEmitter objects

// Compiler::compileModule(Syntax<Array> stx) -> JSSequenceEmitter
Compiler.prototype.compileModule = function (arr) {
    var emitters = arr.value.map(this.compile.bind(this)); 
    return new JSSequenceEmitter(emitters).compileAsStatement();
};

// Compiler::compile(Syntax stx) -> JSEmitter
Compiler.prototype.compile = function (stx) {
    return this.compileExpression(stx); 
};

var keywords = ['null', 'undefined', 'this', 'true', 'false'];

// Compiler::compile(Syntax stx) -> JSEmitter
Compiler.prototype.compileExpression = function (stx) {
    assert.ok(stx instanceof Syntax);
    switch (stx.type) {
        case 'Number':
            return new JSNumberEmitter(stx.value, stx.location);

        case 'String':
            return new JSStringEmitter(stx.value, stx.location);

        case 'Array':
            return this.compileArray(stx);

        case 'Symbol':
            if (keywords.indexOf(stx.escapedValue) != -1) {
                return new JSKeywordEmitter(stx.escapedValue, stx.location);
            } else {
                return new JSSymbolEmitter(stx.escapedValue, stx.location);
            }
            break;

        default:
            throw new SyntaxError('WTF is ' + stx);
    }
};

// Compiler::compileExpressions(Array<Syntax> arr) -> Array<JSEmitter>
Compiler.prototype.compileExpressions = function (arr) {
    return arr.map(this.compileExpression.bind(this));
};

// Compiler::compileMessage(Syntax stx) -> JSEmitter
// foo or (#MSG bar)
Compiler.prototype.compileMessage = function (stx) {
    if (stx.type == 'Symbol') {
        return new JSStringEmitter(stx.value);
    }
    
    assert.equal(stx.type, 'Array', stx + ' must be a Syntax<Array>');
    assert.equal(stx.value[0].type, 'Symbol', 'head of a message must be a symbol');
    assert.equal(stx.value[0].value, '#MSG', 'value of the message symbol is #MSG ' + stx);
    
    return this.compile(stx.value[1]);
};

Compiler.prototype.isMessage = function (stx) {
    return ((stx.type == 'Array' && stx.value[0].type == 'Symbol' && stx.value[0].value == '#MSG') ||
            stx.type == 'Symbol');
};

Compiler.prototype.compileArray = function (stx) {
    var head = stx.value[0],
        tail = stx.value.slice(1),
        args;

    if (head.type === 'Symbol' &&
        head.value in primitives) {        
        return primitives[head.value].call(this, tail);        
    } 

    if (tail.length === 0) {
        throw new SyntaxError('Syntax Error @ ' + stx.location);
    }

    if (tail.length === 1) { 
        // (obj msg) -> _passMessage(obj, 'msg');
        return new JSFunctionCallEmitter(
            new JSSymbolEmitter('_passMessage'),
            [ this.compile(head), this.compileMessage(tail[0]) ]);
    } else {
        // (obj msg arg ...) -> _passMessage(obj, 'msg', [arg, ...]);
        args = this.compileExpressions(tail.slice(1));

        return new JSFunctionCallEmitter(
            new JSSymbolEmitter('_passMessage'), [
                this.compile(head),
                this.compileMessage(tail[0]),
                new JSArrayEmitter(args)
        ]);
    }
};

Compiler.prototype.compileSymbol = function (sym) {
    assert.equal(sym.type, 'Symbol');
    return new JSSymbolEmitter(sym.escapedValue, sym.location);
};

Compiler.prototype.compileSymbols = function (arr) {
    return arr.map(this.compileSymbol, this);
};
