var assert = require('assert'),
    read = require('../compiler/reader.js').read;

[
    'foo.bar["baz"]',     
    'foo.bar.baz["quux"]',
    'foo["bar"].baz',      
    '(foo bar).baz',
    '(foo bar).baz',
    '(foo bar).baz',
    'foo[0] baz'
].forEach(function (src) {
    console.log( JSON.stringify( read(src) ) );
});
