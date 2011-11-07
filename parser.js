(function () {
    /*jshint curly: false, eqnull: true */
    var tokenize, parse, 
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

    TokenTypes = {
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

    tokenize = function (str) {
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

    // Chitchat Grammar
    // ----------------
    //
    // expression   := message-pass | reference | assignment | literal
    // message-pass := '(' expression message args ')'    
    // args         := [ expression ]*
    //
    // reference  := symbol rest 
    // rest       := '.' symbol rest
    //            := '[' expression ']' rest
    //            := epsilon
    //
    // message := symbol | '(' 'msg' expression ')'
    //
    // literal       := hash | array | number | string | function-expr
    // hash          := '#' '{' [ symbol expression ]* '}' 
    // array         := '#' '[' [ expression ]* ']'
    // function-expr := '(' 'fn' '[' [ symbol ]* ']' var-statement? [ expression ]* ')'
    // var-statement := '(' 'var' [ symbol ]* ')' 
    // assignment    := '(' 'set!' reference expression ')'
    

    /*jshint onevar: false*/
    var parseExpression, parseMessagePass, parseReference, parseLiteral;
    var parseDictionary, parseArray, parseFunction, parseConditional, parseAssignment;

    parseExpression = function (tokens) {         
        switch ( tokens[0].type ) {
            case TokenTypes.STRING:
                return tokens.shift().value;

            case TokenTypes.NUMBER:
                return Number(tokens.shift().value);

            case TokenTypes.OCTOTHORPE:
                return parseLiteral(tokens);

            case TokenTypes.SYMBOL:
                return parseReference(tokens);

            default:
                if (tokens[0].type != TokenTypes.OPEN_PAREN)
                    throw "Well, then I'm confused";
        }

        if (tokens[1].type != TokenTypes.SYMBOL) 
            return parseMessagePass(tokens);

        switch (tokens[1].value) {
            case 'if':
                return parseConditional(tokens);

            case 'fn':
                return parseFunction(tokens);

            case 'var':
                throw new Error('var statements must occur in the top level of a function');

            case 'set!':
                return parseAssignment(tokens);

            default:  
                return parseMessagePass(tokens);
        }
    };

    parseLiteral = function (tokens) {
        switch (tokens[1].type) {
            case TokenTypes.OPEN_BRACE:
                return parseDictionary(tokens);
            
            case TokenTypes.OPEN_BRACKET:
                return parseArray(tokens);

            default:
                throw new Error("Well... I'm confused");
        }
    };

    parseFunction = function (tokens) {
        // assume '(' 'fn' '['
        var args = [], vars = [], body = [];

        assert(tokens.shift().type == TokenTypes.OPEN_PAREN);
        assert(tokens[0].value == 'fn');
        assert(tokens.shift().type == TokenTypes.SYMBOL);
        assert(tokens.shift().type == TokenTypes.OPEN_BRACKET);

        while (tokens[0].type != TokenTypes.CLOSE_BRACKET) {
            assert(tokens[0].type == TokenTypes.SYMBOL);
            args.push(tokens.shift().value);
        }

        tokens.shift();
       
        if (tokens[0].type == TokenTypes.OPEN_PAREN &&
            tokens[1].type == TokenTypes.SYMBOL &&
            tokens[1].value == 'var') {
            tokens.shift(); // '('
            tokens.shift(); // 'var'

            while (tokens[0].type != TokenTypes.CLOSE_PAREN) {
                assert(tokens[0].type = TokenTypes.SYMBOL);
                vars.push(tokens.shift().value);
            }

            tokens.shift(); // ')'
        }

        while (tokens[0].type != TokenTypes.CLOSE_PAREN) {
            body.push(parseExpression(tokens));
        }
        tokens.shift();

        return new FunctionExpression(args, vars, body);
    };

    // reference := symbol rest
    // rest      := '.' symbol rest
    //           := '[' expression ']' rest
    //           := epsilon 
    //
    var Reference, SimpleReference, DotReference, BracketReference;

    parseReference = function (tokens) {
        assert(tokens[0].type = TokenTypes.SYMBOL);
        var ref = new SimpleReference(tokens.shift().value),
            sym, exp;

        while (tokens.length) {
            switch (tokens.shift().type) {
                case TokenTypes.DOT:
                    sym = tokens.shift();
                    assert(sym.type == TokenTypes.SYMBOL);
                    ref = new DotReference(ref, sym.value);
                break;

                case TokenTypes.OPEN_BRACKET:
                    assert(tokens.shift().type == TokenTypes.OPEN_BRACKET);
                    exp = parseExpression(tokens);
                    assert(tokens.shift().type == TokenTypes.CLOSE_BRACKET);
                    ref = new BracketReference(ref, exp);
                break;

                default:
                    return ref;
            }             
        }
    };
}.call(this));
