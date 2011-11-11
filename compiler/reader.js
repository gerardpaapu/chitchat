
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

var parseExpr, parseDotAcessor, parseBracketAccessor, parseExpr_, parseRest, parseLiteral,
    parseArray, parseDict,
    ARRAY = new Symbol('#ARRAY'),
    DICT = new Symbol('#DICT'), 
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
    assert(tokens.shift().type === TokenTypes.DOT);
    assert(tokens[0].type === TokenTypes.SYMBOL);
    var msg = new Symbol(tokens.shift().value);

    return parseRest([ root, msg], tokens);
};

parseBracketAccessor = function (tokens, root) {
    assert(tokens.shift().type === TokenTypes.OPEN_BRACKET);
    var expr = parseExpression(tokens);
    assert(tokens.shift().type === TokenTypes.CLOSE_BRACKET);

    return parseRest([root, [MSG, msg]], tokens); 
};

parseLiteral = function (tokens) {
    assert(tokens[0].type === TokenTypes.OCTOTHORPE);

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
    assert(tokens.shift().type === TokenTypes.OCTOTHORPE);
    assert(tokens.shift().type === TokenTypes.OPEN_BRACKET);
    var result = [ARRAY];
        
    while (tokens[0].type != TokenTypes.CLOSE_BRACKET) {
        if (tokens.length === 0) throw "Unexpected end of tokens";
        result.push( parseExpression(tokens) ); 
    }

    tokens.shift();
    return result;
};

parseDict = function (tokens) {
    assert(tokens.shift().type === TokenTypes.OCTOTHORPE);
    assert(tokens.shift().type === TokenTypes.OPEN_BRACE);
    var result = [DICT]; 
        
    while (tokens[0].type != TokenTypes.CLOSE_BRACE) {
        if (tokens.length === 0) throw "Unexpected end of tokens";
        assert(tokens[0].type === TokenTypes.SYMBOL);
        result.push( new Symbol(tokens.shift().value) );

        if (tokens.length === 0) throw "Unexpected end of tokens";
        result.push( parseExpression(tokens) ); 
    }

    tokens.shift();
    return result;
};

exports.parse = parse;
