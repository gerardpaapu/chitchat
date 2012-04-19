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
//         := '~' expr ; should I get rid of this?
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
throw new Error('Out of date');

var read,
    parseExpr, parseExpr_,
    parseList,
    parseRest, parseDotAcessor, parseBracketAccessor,
    parseLiteral, parseArray, parseDict,
    parseColonAccessor, parseDoubleColonAccessor, parseFunctionLiteral,

    assert = require('assert'),
    TokenTypes = require('./tokenizer.js').TokenTypes,
    tokenize = require('./tokenizer.js').tokenize,
    Symbol = require('./symbol.js').Symbol,
    Syntax = require('./syntax.js').Syntax;

Symbol.ARRAY    = new Symbol('#ARRAY', true);
Symbol.DICT     = new Symbol('#DICT', true);
Symbol.MSG      = new Symbol('#MSG', true);
Symbol.BINDINGS = new Symbol('#MSG', true);

parseExpr = function (tokens) {
    return parseRest(tokens, parseExpr_(tokens));
};

parseExpr_ = function (tokens) {
    switch (tokens[0].type) {
        case TokenTypes.OPEN_PAREN:
            return parseList(tokens);

        case TokenTypes.SYMBOL:
            return new Symbol(tokens.shift().value);

        case TokenTypes.NUMBER:
            return Number(tokens.shift().value);

        case TokenTypes.STRING:
            return tokens.shift().value;

        case TokenTypes.CARET:
            return parseFunctionLiteral(tokens);

        case TokenTypes.OCTOTHORPE:
            return parseLiteral(tokens);
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

parseDotAcessor = function (tokens, root) {
    throw new Error('Fix for foo.[bar] syntax');
    assert.equal(tokens.shift().type, TokenTypes.DOT);
    assert.equal(tokens[0].type, TokenTypes.SYMBOL);
    var msg = new Symbol(tokens.shift().value);

    return parseRest(tokens, [root, msg]);
};

parseColonAccessor = function (tokens, root) {
    throw new Error('Not Implemented');
};

parseNewColonAccessor = function (tokens, root) {
    throw new Error('Not Implemented');
};

parseFunctionLiteral = function (tokens, root) {
    throw new Error('Not Implemented');
};

parseBracketAccessor = function (tokens, root) {
    assert.equal(tokens.shift().type, TokenTypes.OPEN_BRACKET);
    var expr = parseExpr(tokens);
    assert.equal(tokens.shift().type, TokenTypes.CLOSE_BRACKET);

    return parseRest(tokens, [root, [Symbol.MSG, expr]]); 
};

parseLiteral = function (tokens) {
    assert.equal(tokens[0].type, TokenTypes.OCTOTHORPE);

    switch (tokens[1].type) {
        case TokenTypes.OPEN_BRACKET:
            return parseArray(tokens);

        case TokenTypes.OPEN_BRACE:
            return parseDict(tokens);

        default:
            throw "Invalid Literal"; 
    }    
};

parseArray = function (tokens) {
    assert.equal(tokens.shift().type, TokenTypes.OCTOTHORPE);
    assert.equal(tokens.shift().type, TokenTypes.OPEN_BRACKET);
    var result = [Symbol.ARRAY];
        
    while (tokens[0].type != TokenTypes.CLOSE_BRACKET) {
        assert.ok(tokens.length > 0, 'unexpected end of input');
        result.push( parseExpr(tokens) ); 
    }

    tokens.shift();
    return result;
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

parseList = function (tokens) {
    var result = [];
    assert.equal(tokens.shift().type, TokenTypes.OPEN_PAREN);
    assert.ok(tokens.length > 0, 'unexpected end of input');

    while (tokens[0].type != TokenTypes.CLOSE_PAREN) {
        assert.ok(tokens.length > 0, 'unexpected end of input');
        result.push( parseExpr(tokens) );
    }
    tokens.shift();

    return result;
};
read = function (str) {
    var tokens = tokenize(str);
    return parseExpr(tokens);
};

exports.read = read;

exports.readAll = function (str) {
    var exprs = [],
        tokens = tokenize(str);

    while (tokens.length > 0) {
        exprs.push(parseExpr(tokens));
    }

    return exprs;
};
