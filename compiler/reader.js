// CHITCHAT GRAMMAR
// ================
// expr := expr' rest
//
// expr' := '(' expr* ')'
//       := symbol
//       := literal
//
// rest := '.' symbol rest
//      := '[' expr ']' rest
//      := epsilon
//
// literal := number | string | array | dict
// array   := '#[' expr* ']'  
// dict    := '#{' [ symbol expr ]* '}'

var parseExpr, parseExpr_,
    parseList,
    parseRest, parseDotAcessor, parseBracketAccessor,
    parseLiteral, parseArray, parseDict,

    assert = require('assert'),
    T = require('./tokenizer.js'),
    TokenTypes = T.TokenTypes,
    tokenize = T.tokenize,
    Symbol, ARRAY, DICT, MSG;

Symbol = function (str) {
    this.str = str;
};

Symbol.prototype.toString = function () {
    return '<' + this.str + '>';
};

ARRAY = new Symbol('#ARRAY');
DICT = new Symbol('#DICT');
MSG = new Symbol('#MSG');

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

        case TokenTypes.OCTOTHORPE:
            return parseLiteral(tokens);
    }
};

parseRest = function (tokens, root) {
    if (tokens.length === 0) return root;

    switch (tokens[0].type) {
        case TokenTypes.DOT:
            return parseDotAcessor(tokens, root);

        case TokenTypes.OPEN_BRACKET:
            return parseBracketAccessor(tokens, root);

        default:
            return root;
    }
};

parseDotAcessor = function (tokens, root) {
    assert.ok(tokens.shift().type === TokenTypes.DOT);
    assert.ok(tokens[0].type === TokenTypes.SYMBOL);
    var msg = new Symbol(tokens.shift().value);

    return parseRest(tokens, [root, msg]);
};

parseBracketAccessor = function (tokens, root) {
    assert.ok(tokens.shift().type === TokenTypes.OPEN_BRACKET);
    var expr = parseExpr(tokens);
    assert.equal(tokens.shift().type, TokenTypes.CLOSE_BRACKET);

    return parseRest(tokens, [root, [MSG, expr]]); 
};

parseLiteral = function (tokens) {
    assert.ok(tokens[0].type === TokenTypes.OCTOTHORPE);

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
    assert.ok(tokens.shift().type === TokenTypes.OCTOTHORPE);
    assert.ok(tokens.shift().type === TokenTypes.OPEN_BRACKET);
    var result = [ARRAY];
        
    while (tokens[0].type != TokenTypes.CLOSE_BRACKET) {
        if (tokens.length === 0) throw "Unexpected end of tokens";
        result.push( parseExpr(tokens) ); 
    }

    tokens.shift();
    return result;
};

parseDict = function (tokens) {
    assert.ok(tokens.shift().type === TokenTypes.OCTOTHORPE);
    assert.ok(tokens.shift().type === TokenTypes.OPEN_BRACE);
    var result = [DICT]; 
        
    while (tokens[0].type != TokenTypes.CLOSE_BRACE) {
        if (tokens.length === 0) throw "Unexpected end of tokens";
        assert.ok(tokens[0].type === TokenTypes.SYMBOL);
        result.push( new Symbol(tokens.shift().value) );

        if (tokens.length === 0) throw "Unexpected end of tokens";
        result.push( parseExpr(tokens) ); 
    }

    tokens.shift();
    return result;
};

parseList = function (tokens) {
    var result = [];
    assert.ok(tokens.shift().type === TokenTypes.OPEN_PAREN);
    if (tokens.length === 0) throw "Unexpected end of tokens";

    while (tokens[0].type != TokenTypes.CLOSE_PAREN) {
        if (tokens.length === 0) throw "Unexpected end of tokens";
        result.push( parseExpr(tokens) );
    }
    tokens.shift();

    return result;
};
read = function (str) {
    var tokens = tokenize(str);
    console.log(tokens);
    return parseExpr(tokens);
};

exports.read = read;
