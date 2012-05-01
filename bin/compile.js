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
    output = new Compiler().compileModule(stx);
    // ast = jsp.parse(js);
    // ast = pro.ast_squeeze(ast, { make_seqs: false });
    // output = pro.gen_code(ast, { beautify: true });
    console.log(output);
});
