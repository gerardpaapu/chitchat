#!/usr/bin/env node
var Compiler = require('../src/compiler/compiler.js').Compiler, 
    Parser = require('../src/compiler/reader.js').Parser,
    tokenize = require('../src/compiler/tokenizer.js').tokenize,
    jsp = require('uglify-js').parser,
    pro = require('uglify-js').uglify,
    src = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (data) {
    src += data;
});

process.stdin.on('end', function (data) {
    var js, ast, output, stx, tokens;

    tokens = tokenize(src); 
    stx = new Parser(tokens).parseModule();
    js = new Compiler().compileModule(stx);
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
    process.stdout.write('var _passMessage = require("chitchat").passMessage;\n');
    process.stdout.write(output);
    process.stdout.write('\n');
});
