(function () {
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

    var assert, TokenTypes,
        parseExpression, parseMessagePass, parseReference, parseLiteral, parseList,
        Symbol, MSG, ARRAY, DICT;

    TokenTypes = require('./tokenizer.js');

    assert = function (exp, msg) {
        if (!exp) throw new Error(msg || "assertion failed");
    };

    exports.Symbol = Symbol = function (str) {
        this.str = str;
    };

    MSG = new Symbol('#MSG');
    ARRAY = new Symbol('#ARRAY');
    DICT = new Symbol('#DICT');

    parseExpression = function (tokens) {         
        switch ( tokens[0].type ) {
            case TokenTypes.STRING:
                return tokens.shift().value;

            case TokenTypes.NUMBER:
                return Number(tokens.shift().value);

            case TokenTypes.OPEN_BRACKET:
                return parseArray(tokens);
            
            case TokenTypes.OPEN_BRACE:
                return parseDictionary(tokens);

            case TokenTypes.SYMBOL:
                return parseReference(tokens);

            case TokenTypes.OPEN_PAREN:
                return parseList(tokens);

            default:
                throw "Well, then I'm confused";
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

    parseDictionary = function (tokens) {
        var tree = [DICT];
        assert(tokens.shift().type == TokenTypes.OPEN_BRACE);

        while (tokens[0].type != TokenTypes.CLOSE_BRACE) {
            tree.push( parseExpression(tokens) );
        }

        tokens.shift();

        return tree;
    };

    parseArray = function (tokens) {
        var tree = [ARRAY];
        assert(tokens.shift().type == TokenTypes.OPEN_BRACKET);

        while (tokens[0].type != TokenTypes.CLOSE_BRACKET) {
            tree.push( parseExpression(tokens) );
        }

        tokens.shift();
        return tree;
    };


    // identifier := symbol ; This must be a legal javascript identifier
    // reference  := identifier rest
    // rest       := '.' symbol rest
    //            := '[' expression ']' rest
    //            := epsilon 
    parseReference = function (tokens) {
        assert(tokens[0].type = TokenTypes.SYMBOL);
        
        var ref = new Symbol(tokens.shift().value), 
            sym, exp;

        while (tokens.length) {
            switch (tokens.shift().type) {
                case TokenTypes.DOT:
                    sym = tokens.shift();
                    assert(sym.type == TokenTypes.SYMBOL);
                    ref = [ref, new Symbol(sym.value)];
                break;

                case TokenTypes.OPEN_BRACKET:
                    assert(tokens.shift().type == TokenTypes.OPEN_BRACKET);
                    exp = parseExpression(tokens);
                    assert(tokens.shift().type == TokenTypes.CLOSE_BRACKET);
                    ref = [ref, [MSG, exp ]];
                break;

                default:
                    return ref;
            }             
        }
    };
}.call(this));
