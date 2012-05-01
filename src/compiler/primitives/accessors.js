var classString = require('../../runtime/classString.js').classString,
    Symbol = require('../symbol.js').Symbol,
    JSSymbolEmitter = require('../emitter.js').JSSymbolEmitter,
    JSAssignmentEmitter = require('../emitter.js').JSAssignmentEmitter,
    JSAccessorEmitter = require('../emitter.js').JSAccessorEmitter,
    JSStringEmitter = require('../emitter.js').JSStringEmitter,
    JSArrayEmitter = require('../emitter.js').JSArrayEmitter,
    JSFunctionCallEmitter = require('../emitter.js').JSFunctionCallEmitter,
    assert = require('assert');

module.exports = {
    'set': function (arr) {
        var obj, msg, place, value;

        place = arr[0];
        value = arr[1];

        // (set foo bar) -> foo = bar
        if (place.type === 'Symbol') {
            return new JSAssignmentEmitter(this.compile(place),
                                           this.compile(value));
        }

        assert.equal(place.type, 'Array');

        // (set (#GET foo bar) baz)   -> foo[bar] = baz 
        if (place.value[0].type == 'Symbol' &&
            place.value[0].value === '#GET') {

            if (place.value.length !== 3) throw new SyntaxError(place);

            obj = place.value[1];
            msg = place.value[2];

            return new JSAssignmentEmitter(
                new JSAccessorEmitter(this.compile(obj), this.compile(msg)),
                this.compile(value));
        }

        // (set (foo bar) baz)        -> _passMessage(foo, 'set', ['bar', baz])
        // (set (foo (#MSG bar)) baz) -> _passMessage(foo, 'set', [bar, baz])
        assert.equal(place.value.length, 2);

        obj = place.value[0];
        msg = place.value[1];

        assert.ok(this.isMessage(msg));

        return new JSFunctionCallEmitter(
            new JSSymbolEmitter('_passMessage'),
            [
                this.compile(obj),
                new JSStringEmitter('set'),
                new JSArrayEmitter([
                       this.compileMessage(msg),
                       this.compile(value)
                ])
            ]);  
    },

    '#GET': function (arr) {
        // (#GET foo bar) -> foo[bar]
        return new JSAccessorEmitter(this.compile(arr[0]),
                                     this.compile(arr[1]));
    }
};
