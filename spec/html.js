var read = require('fs').readFileSync,
    tokenize = require('../compiler/tokenizer.js').tokenize,
    src, tokens, html, src_position, i, max, token;

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
    src_position = 0;

    for (i = 0; i < tokens.length; i++) {
        token = tokens[i];
        // emit everything up to the next token
        html += ( src.slice(src_position, token.position[0]) );
        // emit the start tag
        html += ['<span class="', token.type, '">'].join('');
        html += ( src.slice(token.position[0], token.position[1]) );
        // emit the end tag
        html += '</span>';
        src_position = token.position[1];
    }
    // emit everything remaining
    html += src.slice(src_position);

    return ('<pre>' + html + '</pre>');
}
