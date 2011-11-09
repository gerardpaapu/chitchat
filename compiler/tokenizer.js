(function () {
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
        RIGHT_BRACE: 'RIGHT_BRACE',
        OPEN_BRACKET: 'OPEN_BRACKET',
        RIGHT_BRACKET: 'RIGHT_BRACKET',
        NUMBER: 'NUMBER',
        DOT: 'DOT',
        SYMBOL: 'SYMBOL',
        STRING: 'STRING'
    };

    SIMPLE_TOKENS = {
        OPEN_PAREN: '(', CLOSE_PAREN: ')',
        OPEN_BRACE: '{', CLOSE_BRACE: '}',
        OPEN_BRACKET: '[', CLOSE_BRACKET: ']',
        OCTOTHORPE: '#'
    };

    PATTERNS = {
        SYMBOL: /_|[a-z]\w*/,
        NUMBER: /-?(0|([1-9]\d*))(\.\d+)?((e|E)(\+|\-)\d+)?/
    };

    escape_table = {
        '"': '"',
        '\\': '\\',
        b: '\b',
        f: '\f',
        n: '\n',
        r: '\r',
        t: '\t'
    };

    exports.tokenize = tokenize = function (str) {
        var tokens = [], i = 0;
        while (i < str.length) i = readToken(tokens, str, i);
        return tokens;
    };

    readToken = function (tokens, str, i) {
        var char, head, match, slice, key, end;

        char = str.charAt(i);

        switch (str.charAt(i)) {
            case ' ':
            case '\t':
            case '\n':
                return i + 1;

            // comments begin with ';' and continue to the end of the line
            case ';':
                while (str.charAt(i) != '\n') i++;
                return i + 1;

            case '"':
                return readString(tokens, str, i);
        }

        for (key in SIMPLE_TOKENS) if (SIMPLE_TOKENS.hasOwnProperty(key)) {
            assert(key in TokenTypes, key + ' is a TokenType');

            end = i + SIMPLE_TOKENS[key].length; 
            slice = str.slice(i, end); 

            if (slice === SIMPLE_TOKENS[key]) {
                tokens.push({ type: TokenTypes[key] });
                return end;
            }
        }

        head = str.slice(i);

        for (key in PATTERNS) if (PATTERNS.hasOwnProperty(key)) { 
            assert(key in TokenTypes, key + ' is a TokenType');

            match = PATTERNS[key].exec(head);

            if (match) {
                tokens.push({ type: TokenTypes[key], value: match[0]});
                return i + match[0].length; 
            }
        }

        throw new Error("Couldn't tokenize " + str + " @ " + i + "'" + char + "'");
    };

    readString = function (tokens, str, i) {
        var code, code_point, start = i, value = '';

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

                case '"':
                    tokens.push({ type: TokenTypes.STRING, value: value });
                    return i + 1;

                default:
                    value += str.charAt(i);
            }
        }

        throw new Error("unexpected EOF in string starting at " + i);
    };
}());
