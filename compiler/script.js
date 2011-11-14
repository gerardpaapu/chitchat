#!/usr/bin/env node
var compile = require('./compile.js').compile, 
    src = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (data) {
    src += data;
});

process.stdin.on('end', function (data) {
    process.stdout.write('// Chitchat Source\n');
    process.stdout.write('// -----------------\n');
    src.split('\n').forEach(function (line) {
        process.stdout.write('// ' + line + '\n');
    });
    process.stdout.write('// -----------------\n');
    process.stdout.write('// Javascript Output\n');
    process.stdout.write('// -----------------\n');

    process.stdout.write('var CHITCHAT = require("./runtime/index.js");\n');
    process.stdout.write(compile(src));
    process.stdout.write('\n');
});
