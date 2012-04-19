var read = require('fs').readFileSync,
    tokenize = require('../src/compiler/tokenizer.js').tokenize,
    src, tokens, html, src_location, i, max, token;

src = '';
process.stdin.resume();
process.stdin.on('data', function (d) {
    src += d;
});

process.stdin.on('end', function () {
    process.stdout.write( htmlify( src ) );
});

function htmlify(src) { 
    tokens = tokenize( src );

    html = '';
    src_location = 0;

    for (i = 0; i < tokens.length; i++) {
        token = tokens[i];
        // emit everything up to the next token
        console.log(token);
        html += ( src.slice(src_location, token.location.start) );
        // emit the start tag
        html += ['<span class="', token.type, '">'].join('');
        html += ( src.slice(token.location.start, token.location.end) );
        // emit the end tag
        html += '</span>';
        src_location = token.location.end;
    }
    // emit everything remaining
    html += src.slice(src_location);

    return ('<pre>' + html + '</pre>');
}
