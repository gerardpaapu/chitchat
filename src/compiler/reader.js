// CHITCHAT GRAMMAR
// ================
// module := ( expr | definition ) +
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
var Parser,
    assert = require('assert'),
    TokenTypes = require('./tokenizer.js').TokenTypes,
    tokenize = require('./tokenizer.js').tokenize,
    Symbol = require('./symbol.js').Symbol,
    Span = require('./syntax.js').Span,
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

var Parser = function (tokens) {
    this.tokens = tokens; 
    this.index = 0;    // current token
    this.token = this.tokens[this.index];
    this.location = this.token.location; // source position
};

exports.Parser = Parser;

Parser.prototype.isEmpty = function () {
    return this.index >= this.tokens.length;
};

Parser.prototype.next = function () {
    assert.ok(!this.isEmpty());
    this.index ++;
    this.token = this.tokens[this.index];
    if (this.token) {
        assert.ok(this.token.location);
        this.location = this.token.location;
    }
};

Parser.prototype.shift = function () {
    var token = this.token;
    this.next();
    return token;
};

Parser.prototype.Syntax = function (value) {
    if (!this.location) throw new Error('No Location', this.tokens.slice(0, 2));
    return new Syntax(this.location, value);
};

Parser.prototype.parseModule = function () {
    var start = this.location,
        value = [],
        end, loc;

    try { 
        while (this.token) {
            value.push(this.parseExpr());
        }
    } catch (err) {
        console.log('Error Reading @ ', this.location);
        throw err;
    }

    end = this.location;
    loc = Span.over(start, end);

    return new Syntax(loc, value);
};

Parser.prototype.parseExpr = function () {
    return this.parseRest(this.parseExpr_());
};

Parser.prototype.parseExpr_ = function () {
    var token;
    switch (this.token.type) {
        case TokenTypes.OPEN_PAREN:
            return this.parseList();

        case TokenTypes.OPEN_BRACKET:
            return this.parseBindings();

        case TokenTypes.OPEN_BRACE:
            return this.parseBlock();

        case TokenTypes.SYMBOL:
            token = this.shift();
            return new Syntax(token.location, new Symbol(token.value));

        case TokenTypes.NUMBER:
            token = this.shift();
            return new Syntax(token.location, Number(token.value));

        case TokenTypes.STRING:
            token = this.shift();
            return new Syntax(token.location, token.value);

        case TokenTypes.POSITIONAL_ARG:
            token = this.shift();
            return new Syntax(token.location, [Symbol.ARGS, token.value]);

        case TokenTypes.CARET:
            return this.parseFunctionLiteral();

        case TokenTypes.OCTOTHORPE:
            return this.parseLiteral();

        default:
            throw new SyntaxError();
    }
};

Parser.prototype.parseRest = function (root) {
    if (this.isEmpty()) return root;

    switch (this.token.type) {
        case TokenTypes.DOT:
            return this.parseDotAcessor(root);

        case TokenTypes.DOUBLE_COLON:
            return this.parseDoubleColonAccessor(root);

        case TokenTypes.COLON:
            return this.parseColonAccessor(root);

        default:
            return root;
    }
};


Parser.prototype.parseAcessor = function (_return) {
    // _return: function (Syntax root, Syntax expr) -> Syntax
    var token, expr;

    switch (this.token.type) {
        case TokenTypes.SYMBOL:
            token = this.shift();
            return new Syntax(token.location, token.value);

        case TokenTypes.OPEN_BRACKET:
            this.shift();
            expr = this.parseExpr();
            assert.equal(this.shift().type, TokenTypes.CLOSE_BRACKET);
            return expr;

        default:
            throw new SyntaxError('expected "[" or a symbol');
    }
};

Parser.prototype.parseDotAcessor = function (root) {
    // Parsing root.symbol or root.[exp]
    assert.equal(this.shift().type, TokenTypes.DOT);

    if (!root.location) {
        console.log(root.toString());
    }
    var prop = this.parseAcessor(),
        loc = new Span(root.location.start, prop.location.end),
        msg = new Syntax(prop.location, Symbol.MSG),
        stx;

    stx =  new Syntax(loc, [root, new Syntax(prop.location, [msg, prop])]);

    return this.parseRest(stx);
};

Parser.prototype.parseColonAccessor = function (root) {
    // Parsing root:symbol or root:[exp]
    assert.equal(this.shift().type, TokenTypes.COLON);

    var prop = this.parseAcessor(),
        loc = new Span(root.location.start, prop.location.end),
        get = new Syntax(loc, Symbol.GET);

    this.parseRest(new Syntax(loc, [get, root, prop]));
};

Parser.prototype.parseDoubleColonAccessor = function (root) {
    // Parsing root::symbol or root::[exp]
    assert.equal(this.shift().type, TokenTypes.COLON);

    var prop = this.parseAcessor(),
        loc = new Span(root.location.start, prop.location.end),
        proto = new Syntax(loc, Symbol.PROTOTYPE);

    return this.parseRest(new Syntax(loc, [proto, root, prop]));
};

Parser.prototype.parseFunctionLiteral = function () {
    assert.equal(this.shift().type, TokenTypes.CARET);

    var bindings,
        // TODO: should I represent this as something other than a symbol?
        _function = this.Syntax(new Symbol('function'));

    if (this.token.type === TokenTypes.OPEN_BRACKET) {
        // Parsing "^" bindings expr
        bindings = this.parseBindings();     
    } else {
        // Parsing "^" expr
        bindings = this.Syntax([this.Syntax(Symbol.BINDINGS)]);
    }

    return this.Syntax([_function, bindings, this.parseExpr()]);
};

Parser.prototype.parseLiteral = function () {
    assert.equal(this.token.type, TokenTypes.OCTOTHORPE);

    switch (this.tokens[this.index + 1].type) {
        case TokenTypes.OPEN_BRACKET:
            return this.parseArray();

        case TokenTypes.OPEN_BRACE:
            return this.parseDict();

        default:
            throw new SyntaxError('"#" must start an array or dictionary literal'); 
    }    
};

Parser.prototype.parseArray = function () {
    var _array = this.Syntax(Symbol.ARRAY),
        start, end, value, loc;

    assert.equal(this.shift().type, TokenTypes.OCTOTHORPE);

    start = this.location;
    value = this.parseBracketPair(TokenTypes.OPEN_BRACKET, TokenTypes.CLOSE_BRACKET);
    end = this.location;
    loc = Span.over(start, end);

    return new Syntax(loc, [_array, new Syntax(loc, value)]);
};

Parser.prototype.parseDict = function () {
    assert.equal(this.shift().type, TokenTypes.OCTOTHORPE);
    assert.equal(this.shift().type, TokenTypes.OPEN_BRACE);

    var _dict = this.Syntax(Symbol.DICT),
        start = this.location,
        result = [_dict]; 
        
    while (this.token.type != TokenTypes.CLOSE_BRACE) {
        assert.ok(!this.isEmpty(), 'unexpected end of input');
        assert.equal(this.token.type, TokenTypes.SYMBOL);
        result.push(this.Syntax(new Symbol(this.shift().value)));

        assert.ok(!this.isEmpty(), 'unexpected end of input');
        result.push(this.parseExpr()); 
    }

    this.shift();

    return result;
};

Parser.prototype.parseBracketPair = function (start, stop) {
    var result = [];
    assert.equal(this.shift().type, start);
    assert.ok(!this.isEmpty(), 'unexpected end of input');

    while (this.token.type != stop) {
        assert.ok(!this.isEmpty(), 'unexpected end of input');
        result.push(this.parseExpr());
        assert.ok(!this.isEmpty(), 'unexpected end of input');
    }
    this.shift();
    return result;
};

// parsing "(blah blah blah)"
Parser.prototype.parseList = function () {
    var start, value, end;
    start = this.location;
    value = this.parseBracketPair(TokenTypes.OPEN_PAREN, TokenTypes.CLOSE_PAREN);
    end = this.location;

    return new Syntax(Span.over(start, end), value);
};

// parsing "[blah blah blah]", should only appear in
// function literals and let expressions 
Parser.prototype.parseBindings = function () {
    var bindings = this.Syntax(Symbol.BINDINGS),
        start = this.location,
        value = this.parseBracketPair(TokenTypes.OPEN_BRACKET, TokenTypes.CLOSE_BRACKET),
        end = this.location,
        loc = Span.over(start, end);

    return new Syntax(loc, [bindings].concat(value));
};

Parser.prototype.parseBlock = function () {
    var start = this.location,
        contents = this.parseBracketPair(TokenTypes.OPEN_BRACE, TokenTypes.CLOSE_BRACE),
        end = this.location,
        loc = Span.over(start, end),
        block = new Syntax(start, Symbol.BLOCK);

    return new Syntax(loc, [Symbol.BLOCK].concat(contents));
};
