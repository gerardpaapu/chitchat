var assert = require('assert'),
    tokenize = require('../compiler/tokenizer.js').tokenize;

[
    'foo.bar["baz"]',     
    'foo.bar.baz["quux"]',
    'foo["bar"].baz',      
    '(foo bar).baz',
    'foo baz',
    '[1]2',
    'foo[1] baz',
    '[1]',
    '{1}',
    '{f 3} p'
].forEach(function (src) {
    console.log(src,  JSON.stringify( tokenize(src) ) );
});
