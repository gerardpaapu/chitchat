var assert = require('assert'),
    Symbol = require('../symbol.js').Symbol,
    JSFunctionEmitter = require('../emitter.js').JSFunctionEmitter,
    JSAssignmentEmitter = require('../emitter.js').JSAssignmentEmitter,
    JSAccessorEmitter = require('../emitter.js').JSAccessorEmitter,
    JSSequenceEmitter = require('../emitter.js').JSSequenceEmitter,
    JSStringEmitter = require('../emitter.js').JSStringEmitter,
    JSSymbolEmitter = require('../emitter.js').JSSymbolEmitter;

module.exports = {
    'class': function (arr) {
        var name = arr[0],
            constructors,
            constructorStx,
            methodStx,
            methods,
            constructor,
            statements = [];

        constructors = arr.slice(1).filter(function (stx) {
            return stx.type == 'Array' && stx.value[0].value == 'constructor';
        });

        methodStx = arr.slice(1).filter(function (stx) {
            return stx.type == 'Array' && stx.value[0].value == 'method';
        });

        assert.ok(constructors.length < 2);

        if (constructors.length === 0) {
            constructor = new JSFunctionEmitter([], [], null);
        } else {
            // (constructor{0} args{1} body{2..}) 
            constructor = new JSFunctionEmitter(this.compileSymbols(constructors[0].value[1].value),
                                                this.compileExpressions(constructors[0].value.slice(2)),
                                                null);
        }

        statements.push(new JSAssignmentEmitter(this.compileSymbol(name), constructor));

        methods = methodStx.map(function (stx) {
            // (method{0} ({1} name{0} args{1..}) body{2..})
            var methodName = stx.value[1].value[0],
                args = stx.value[1].value.slice(1),
                method = stx.value.slice(2);
            
            assert.equal(methodName.type, 'Symbol');

            return new JSAssignmentEmitter(
                new JSAccessorEmitter(
                    new JSAccessorEmitter(this.compileSymbol(name), new JSStringEmitter('prototype')),
                    new JSStringEmitter(methodName.value)),

                new JSFunctionEmitter(this.compileSymbols(args),
                                      this.compileExpressions(method.slice(0, -1)),
                                      this.compileExpression(method[method.length - 1])));
        }, this);
        
        statements.push.apply(statements, methods);

        return new JSSequenceEmitter(statements);
    }
};
