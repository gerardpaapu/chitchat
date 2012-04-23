#!/usr/bin/env node

var Parser = require('../src/compiler/reader.js').Parser,
    tokenize = require('../src/compiler/tokenizer.js').tokenize,
    src;

src = '';
process.stdin.resume();
process.stdin.on('data', function (d) {
    src += d;
});

process.stdin.on('end', function () {
    var tokens = tokenize(src);
    console.log( JSON.stringify( new Parser(tokens).parseModule() ));
});

