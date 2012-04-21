// CHITCHAT GRAMMAR
// ================
// module := expr+
//
// expr := expr' rest
//
// expr' := '(' expr message expr* ')'
//       := '(' symbol expr* ')'
//       := '{' expr* '}'
//       := symbol
//       := literal
//
// message := symbol
//         := '(' 'message' expr ')' 
//
// rest := '.' symbol rest
//      := '.' '[' expr ']' rest
//      := ':' symbol rest
//      := ':' '[' expr ']' rest
//      := epsilon
//
// literal  := number | string | array | dict | function | letexpr
//
// array    := '#[' expr* ']'  
//
// dict     := '#{' [ symbol expr ]* '}'
//
// function := '^' '[' [ symbol ]* ']' expr
//          := '^' expr
//          := '(' 'function' '[' symbol ']' expr* ')' 
//
// letexpr  := '(' 'let' '[' binding* ']' expr* ')'
//
// binding  := symbol | '(' symbol expr ')'
var read,
    parseExpr, parseExpr_,
    parseBracketPair, parseList, parseBindings, parseBlock,
    parseRest, parseAcessor, parseDotAcessor, parseBracketAccessor,
    parseLiteral, parseArray, parseDict,
    parseColonAccessor, parseDoubleColonAccessor, parseFunctionLiteral,

    assert = require('assert'),
    TokenTypes = require('./tokenizer.js').TokenTypes,
    tokenize = require('./tokenizer.js').tokenize,
    Symbol = require('./symbol.js').Symbol,
    Syntax = require('./syntax.js').Syntax;


// Some unreadable symbols are defined to transform everything
// into prefix syntax e.g.
//
//   #[1 2 3] -> (#ARRAY 1 2 3)
//   foo.bar  -> (#MSG foo "bar")
//
Symbol.ARGS = new Symbol('#ARGS', true);
Symbol.ARRAY = new Symbol('#ARRAY', true);
Symbol.BINDINGS = new Symbol('#BINDINGS', true);
Symbol.BLOCK = new Symbol('#BLOCK', true);
Symbol.DICT = new Symbol('#DICT', true);
Symbol.GET = new Symbol('#GET', true);
Symbol.MSG = new Symbol('#MSG', true);
Symbol.PROTOTYPE = new Symbol('#PROTOTYPE', true);

parseExpr = function (tokens) {
    return parseRest(tokens, parseExpr_(tokens));
};

parseExpr_ = function (tokens) {
    switch (tokens[0].type) {
        case TokenTypes.OPEN_PAREN:
            return parseList(tokens);

        case TokenTypes.OPEN_BRACKET:
            return parseBindings(tokens);

        case TokenTypes.OPEN_BRACE:
            return parseBlock(tokens);

        case TokenTypes.SYMBOL:
            return new Symbol(tokens.shift().value);

        case TokenTypes.NUMBER:
            return Number(tokens.shift().value);

        case TokenTypes.STRING:
            return tokens.shift().value;

        case TokenTypes.POSITIONAL_ARG:
            return [Symbol.ARGS, tokens.shift().value];

        case TokenTypes.CARET:
            return parseFunctionLiteral(tokens);

        case TokenTypes.OCTOTHORPE:
            return parseLiteral(tokens);

        default:
            throw new SyntaxError();
    }
};

parseRest = function (tokens, root) {
    if (tokens.length === 0) return root;

    switch (tokens[0].type) {
        case TokenTypes.DOT:
            return parseDotAcessor(tokens, root);

        case TokenTypes.DOUBLE_COLON:
            return parseDoubleColonAccessor(tokens, root);

        case TokenTypes.COLON:
            return parseColonAccessor(tokens, root);

        default:
            return root;
    }
};

parseAcessor = function (tokens, root, _return) {
    var symbol, expr;

    switch (tokens[0].type) {
        case TokenTypes.SYMBOL:
            symbol = new Symbol(tokens.shift().value); 
            return parseRest(tokens, _return(root, symbol.value));

        case TokenTypes.OPEN_BRACKET:
            tokens.shift();
            expr = parseExpr(tokens);
            assert.equal(tokens.shift().type, TokenTypes.CLOSE_BRACKET);

            return parseRest(tokens, _return(root, expr));

        default:
            throw new SyntaxError('expected "[" or a symbol');
    }
};

parseDotAcessor = function (tokens, root) {
    // Parsing root.symbol or root.[exp]
    assert.equal(tokens.shift().type, TokenTypes.DOT);

    return parseAcessor(tokens, root, function (root, prop) {
        return [root, [Symbol.MSG, prop]];
    });
};

parseColonAccessor = function (tokens, root) {
    // Parsing root:symbol or root:[exp]
    assert.equal(tokens.shift().type, TokenTypes.COLON);

    return parseAcessor(tokens, root, function (root, prop) {
        return [Symbol.GET, root, prop];
    });
};

parseDoubleColonAccessor = function (tokens, root) {
    // Parsing root::symbol or root::[exp]
    assert.equal(tokens.shift().type, TokenTypes.COLON);

    return parseAcessor(tokens, root, function (root, prop) {
        return [Symbol.PROTOTYPE, root, prop];
    });
};

parseFunctionLiteral = function (tokens, root) {
    assert.equal(tokens.shift().type, TokenTypes.CARET);
    var bindings;

    if (tokens[0].type === TokenTypes.OPEN_BRACKET) {
        // Parsing "^" bindings expr
        bindings = parseBindings(tokens);     
    } else {
        // Parsing "^" expr
        bindings = [Symbol.BINDINGS];
    }

    return [new Symbol('function'), bindings, parseExpr(tokens)];
};

parseLiteral = function (tokens) {
    assert.equal(tokens[0].type, TokenTypes.OCTOTHORPE);

    switch (tokens[1].type) {
        case TokenTypes.OPEN_BRACKET:
            return parseArray(tokens);

        case TokenTypes.OPEN_BRACE:
            return parseDict(tokens);

        default:
            throw new SyntaxError('"#" must start an array or dictionary literal'); 
    }    
};

parseArray = function (tokens) {
    assert.equal(tokens.shift().type, TokenTypes.OCTOTHORPE);
    return [Symbol.ARRAY, parseBracketPair(tokens, TokenTypes.OPEN_BRACKET, TokenTypes.CLOSE_BRACKET)];
};

parseDict = function (tokens) {
    assert.equal(tokens.shift().type, TokenTypes.OCTOTHORPE);
    assert.equal(tokens.shift().type, TokenTypes.OPEN_BRACE);
    var result = [Symbol.DICT]; 
        
    while (tokens[0].type != TokenTypes.CLOSE_BRACE) {
        assert.ok(tokens.length > 0, 'unexpected end of input');
        assert.equal(tokens[0].type, TokenTypes.SYMBOL);
        result.push( new Symbol(tokens.shift().value) );

        assert.ok(tokens.length > 0, 'unexpected end of input');
        result.push( parseExpr(tokens) ); 
    }

    tokens.shift();
    return result;
};

parseBracketPair = function (tokens, start, stop) {
    var result = [];
    assert.equal(tokens.shift().type, start);
    assert.ok(tokens.length > 0, 'unexpected end of input');

    while (tokens[0].type != stop) {
        assert.ok(tokens.length > 0, 'unexpected end of input');
        result.push( parseExpr(tokens) );
        assert.ok(tokens.length > 0, 'unexpected end of input');
    }
    tokens.shift();

    return result;
};

// parsing "(blah blah blah)"
parseList = function (tokens) {
    return parseBracketPair(tokens, TokenTypes.OPEN_PAREN, TokenTypes.CLOSE_PAREN);
};

// parsing "[blah blah blah]", should only appear in
// function literals and let expressions 
parseBindings = function (tokens) {
    var contents = parseBracketPair(tokens, TokenTypes.OPEN_BRACKET, TokenTypes.CLOSE_BRACKET);
    return [Symbol.BINDINGS].concat(contents);
};

parseBlock = function (tokens) {
    var contents = parseBracketPair(tokens, TokenTypes.OPEN_BRACE, TokenTypes.CLOSE_BRACE);
    return [Symbol.BLOCK].concat(contents);
};

read = function (str) {
    var tokens = tokenize(str);
    try {
        return parseExpr(tokens);
    } catch (err) {
        throw new SyntaxError(err + ' @ ' + tokens[0].position);
    }
};

exports.read = read;

exports.readAll = function (str) {
    var exprs = [],
        tokens = tokenize(str);
    try {
        while (tokens.length > 0) {
            exprs.push(parseExpr(tokens));
        }
    } catch (err) {
        throw new SyntaxError(err + ' @ ' + tokens[0].location);
    }

    return exprs;
};
