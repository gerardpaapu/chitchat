var assert = require('assert'),
    compile = require('../compiler/compile.js').compile;

[
    'foo.bar["baz"]',     
    'foo.bar.baz["quux"]',
    'foo["bar"].baz',      
    '(foo bar).baz',
    '(if foo.property (foo method "string") foo.delete)',
    '(function (a b) cats[0])',
    '(set! foo bar)',
    '(set! foo.bar baz)',
    '(set! foo.bar.baz quux)',
    '(set! foo.bar[(baz + quux)] quuz)',
    '(function (a b) (var c d e f) foo.bar (var g h))'
].forEach(function (src) {
    console.log(src);
    console.log( JSON.stringify( compile(src) ) );
});

assert.equal(compile('"foo"'), '"foo"');
assert.equal(compile('9'), '9');

// Compiling identifiers
assert.equal(compile('foo'), 'foo');
assert.equal(compile('foo!'), 'foo_bang_');
assert.equal(compile('export'), '_$export');

assert.equal(compile('(set! foo bar)'), 'foo = bar');
assert.equal(compile('(if foo bar baz)'), 'foo?bar:baz');
