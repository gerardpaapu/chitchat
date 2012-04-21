var format = require('../format.js').format,
    classString = require('../../runtime/classString.js').classString,
    Symbol = require('../symbol.js').Symbol,
    assert = require('assert');

module.exports = {
    'set!': function (stx, compiler) {
        // (set foo bar)               -> foo = bar
        // (set! (foo bar) baz)        -> foo['bar'] = baz
        // (set! (foo (#MSG bar)) baz) -> foo[bar] = baz
        var obj, msg, place, value;

        function compile (stx) {
            return compiler.compile(stx);
        }

        place = stx[0];
        value = stx[1];

        if (place instanceof Symbol) {
            return format('$0 = $1', compile(place), compile(value));
        }

        assert.equal(classString(place), 'Array');
        assert.equal(place.length, 2);

        obj = place[0];
        msg = place[1];

        assert.ok((classString(msg) === 'Array' && msg[0] === Symbol.MSG) ||
                  msg instanceof Symbol);

        return format('$0[$1] = $2', compile(obj), compiler.compileMessage(msg), compile(value));
    },

   'set': function () {
       return 'null';
   }, 

   'get!': function () {
       return 'null';
   },

   'get': function () {
       return 'null';
   }
};
