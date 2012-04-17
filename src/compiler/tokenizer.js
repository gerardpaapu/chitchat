/*jshint curly: false, eqnull: true */
/*globals exports: false */
var tokenize, 
    readToken,
    readString,
    TokenTypes,
    escape_table,
    assert,
    SIMPLE_TOKENS,
    PATTERNS;

assert = function (exp, msg) {
    if (!exp) throw new Error(msg || "assertion failed");
};

exports.TokenTypes = TokenTypes = {
    OPEN_PAREN: 'OPEN_PAREN',
    CLOSE_PAREN: 'CLOSE_PAREN',
    OPEN_BRACE: 'OPEN_BRACE',
    CLOSE_BRACE: 'CLOSE_BRACE',
    OPEN_BRACKET: 'OPEN_BRACKET',
    CLOSE_BRACKET: 'CLOSE_BRACKET',
    NUMBER: 'NUMBER',
    DOT: 'DOT',
    SYMBOL: 'SYMBOL',
    STRING: 'STRING',
    OCTOTHORPE: 'OCTOTHORPE',
    CARET: 'CARET',
    POSITIONAL_ARG: 'POSITIONAL_ARG'
};

SIMPLE_TOKENS = {
    OPEN_PAREN: '(', CLOSE_PAREN: ')',
    OPEN_BRACE: '{', CLOSE_BRACE: '}',
    OPEN_BRACKET: '[', CLOSE_BRACKET: ']',
    OCTOTHORPE: '#', DOT: '.', CARET: '^'
};

PATTERNS = {
    NUMBER: /^-?(0|([1-9]\d*))(\.\d+)?((e|E)(\+|\-)\d+)?/,
    SYMBOL: /^[a-zA-Z\-_+=$&%@!?~`<>:|][0-9a-zA-Z\-_+=$&%@!?~`<>:|]*/,
    POSITIONAL_ARG: /^#\d+/
};

escape_table = {
    '"': '"',
    '\'': '\'',
    '\\': '\\',
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t'
};

exports.tokenize = tokenize = function (str) {
    var tokens = [], i = 0;
    while (i < str.length) {
        i = readToken(tokens, str, i);
    }
    return tokens;
};

readToken = function (tokens, str, i) {
    var char, head, match, slice, key, end;

    char = str.charAt(i);

    switch (str.charAt(i)) {
        case ' ':
        case '\t':
        case '\n':
        case ',':
            return i + 1;

        // comments begin with ';' and continue to the end of the line
        case ';':
            while (str.charAt(i) != '\n') i++;
            return i + 1;

        case "'":
            // read single-quote string
            return readString(tokens, str, i, "'");

        case '"':
            // read double-quote string
            return readString(tokens, str, i, '"');

        case '#':
            // read positional arguments
            match = new RegExp(PATTERNS.POSITIONAL_ARG.source).exec(str.slice(i));

            if (match && match.index === 0) {
                end = i + match[0].length;
                tokens.push({ type: TokenTypes.POSITIONAL_ARG, value: match[0], position: [i, end] });
                return end;
            }
    }

    for (key in SIMPLE_TOKENS) if (SIMPLE_TOKENS.hasOwnProperty(key)) {
        assert(key in TokenTypes, key + ' is a TokenType');

        end = i + SIMPLE_TOKENS[key].length; 
        slice = str.slice(i, end); 

        if (slice === SIMPLE_TOKENS[key]) {
            tokens.push({ type: TokenTypes[key], position: [i, end] });
            return end;
        }
    }

    head = str.slice(i);

    for (key in PATTERNS) if (PATTERNS.hasOwnProperty(key)) { 
        assert(key in TokenTypes, key + ' is a TokenType');

        match = new RegExp(PATTERNS[key].source).exec(head);

        if (match && match.index === 0 && match.length > 0) {
            end = i + match[0].length; 
            tokens.push({ type: TokenTypes[key], value: match[0], position: [i, end] });

            return end;
        }
    }

    throw new Error("Couldn't tokenize " + str + " @ " + i + " '" + char + "'");
};

readString = function (tokens, str, i, delimiter) {
    var code, code_point, start = i, value = '';

    assert(str.charAt(i++) === delimiter);

    while (i < str.length) {
        switch (str.charAt(i)) {
            case '\\':
                i++;
                code = str.charAt(i++);
                if (code === 'u') {
                    code_point = parseInt(str.slice(i, i + 4), 16);
                    value += String.fromCharCode(code_point);
                    i += 4;
                } else {
                    value += escape_table[code];
                }
            break;

            case delimiter:
                i++;
                tokens.push({ type: TokenTypes.STRING, value: value, position: [start, i] });
                return i;

            default:
                value += str.charAt(i++);
        }
    }

    throw new Error("Unexpected EOF in string starting at " + start);
};
