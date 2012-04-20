#!/usr/bin/env node

var readAll = require('../src/compiler/reader.js').readAll,
    src;

src = '';
process.stdin.resume();
process.stdin.on('data', function (d) {
    src += d;
});

process.stdin.on('end', function () {
    console.log( readAll(src) );
});

