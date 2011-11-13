var assert = require('assert'),
    compile = require('../compiler/compile.js').compile;

[
    'foo.bar["baz"]',     
    'foo.bar.baz["quux"]',
    'foo["bar"].baz',      
    '(foo bar).baz',
    '(if foo.property (foo method "string") foo.delete)',
    '(function (a b) cats[0])'
].forEach(function (src) {
    console.log(src);
    console.log( JSON.stringify( compile(src) ) );
});