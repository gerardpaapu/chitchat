var Symbol = require('../symbol.js').Symbol,
    JSIIFEEmitter = require('../emitter.js').JSIIFEEmitter,    
    JSSymbolEmitter = require('../emitter.js').JSSymbolEmitter,    
    JSVariableDeclaration = require('../emitter.js').JSVariableDeclaration,    
    JSAssignmentEmitter = require('../emitter.js').JSAssignmentEmitter,    
    assert = require('assert');

module.exports = {
    'let': function (arr) {
        var bindings, statements, result, vars = [], body = [];

        assert.equal(arr[0].type, 'Array');
        assert.equal(arr[0].value[0].type, 'Symbol');
        assert.equal(arr[0].value[0].value, '#BINDINGS');

        bindings = arr[0].value.slice(1);

        bindings.forEach(function (binding) {
            var symbol;
            if (binding.type === 'Symbol') {
                symbol = new JSSymbolEmitter(binding.escapedValue);
            } else if (binding.type === 'Array') {
                assert.equal(binding.value[0].type, 'Symbol');
                symbol = new JSSymbolEmitter(binding.value[0].escapedValue);
                body.push(new JSAssignmentEmitter(symbol, this.compile(binding.value[1])));
            }

            vars.push(symbol);
        }, this);

        arr.slice(1, -1).forEach(function (stx) {
            body.push( this.compile(stx) );
        }, this);

        result = this.compile(arr[arr.length - 1]);
        statements = [ new JSVariableDeclaration(vars) ].concat(body);

        return new JSIIFEEmitter(statements, result);
    }
};
