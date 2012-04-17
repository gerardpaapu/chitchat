#!/usr/bin/env node
var compile = require('../src/compiler/compile.js').compile, 
    jsp = require('uglify-js').parser,
    pro = require('uglify-js').uglify,
    src = '';

throw new Error('TODO: rewrite parser for current syntax');

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (data) {
    src += data;
});

process.stdin.on('end', function (data) {
    var js, ast, output;

    js = compile(src);
    ast = jsp.parse(js);
    ast = pro.ast_squeeze(ast, { make_seqs: false });
    output = pro.gen_code(ast, { beautify: true });

    process.stdout.write('// Chitchat Source\n');
    process.stdout.write('// -----------------\n');
    src.split('\n').forEach(function (line) {
        process.stdout.write('// ' + line + '\n');
    });
    process.stdout.write('// -----------------\n');
    process.stdout.write('// Javascript Output\n');
    process.stdout.write('// -----------------\n');
    process.stdout.write('var CHITCHAT = require("./runtime/index.js");\n');
    process.stdout.write(output);
    process.stdout.write('\n');
});
