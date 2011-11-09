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
    //
    // message := symbol | '(' 'msg' expression ')'
    //
    // literal       := hash | array | number | string | function-expr
    // hash          := '#' '{' [ symbol expression ]* '}' 
    // array         := '#' '[' [ expression ]* ']'
    // function-expr := '(' 'fn' '[' [ symbol ]* ']' var-statement? [ expression ]* ')'
    // var-statement := '(' 'var' [ symbol ]* ')' 
    // assignment    := '(' 'set!' reference expression ')'
    // throw         := '(' 'throw' reference expression ')'
    // try           := '(' 'try' reference expression ')'
    // assignment    := '(' 'set!' reference expression ')'

    var parseExpression, parseMessagePass, parseReference, parseLiteral,
        parseDictionary, parseArray, parseFunction, parseConditional, parseAssignment,
        P;

    P = CHITCHAT.ParseTypes;

    parseExpression = function (tokens) {         
        switch ( tokens[0].type ) {
            case TokenTypes.STRING:
                return new P.StringLiteral(tokens.shift().value);

            case TokenTypes.NUMBER:
                return new P.NumberLiteral(tokens.shift().value);

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

            case 'try':
                return parseTry();

            case 'try/catch/finally':
                return parseTryCatchFinally();

            case 'throw':
                return parseThrow();

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

    parseDictionary = function (tokens) {
        //
    };

    parseArray = function (tokens) {
        //
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

        return new P.FunctionExpression(args, vars, body);
    };

    // identifier := symbol ; This must be a legal javascript identifier
    // reference  := identifier rest
    // rest       := '.' symbol rest
    //            := '[' expression ']' rest
    //            := epsilon 
    parseReference = function (tokens) {
        assert(tokens[0].type = TokenTypes.SYMBOL);
        
        var ref = new Reference(null, new P.Identifier(tokens.shift().value)), 
            sym, exp;

        while (tokens.length) {
            switch (tokens.shift().type) {
                case TokenTypes.DOT:
                    sym = tokens.shift();
                    assert(sym.type == TokenTypes.SYMBOL);
                    ref = new Reference(ref, new P.StringLiteral(sym.value));
                break;

                case TokenTypes.OPEN_BRACKET:
                    assert(tokens.shift().type == TokenTypes.OPEN_BRACKET);
                    exp = parseExpression(tokens);
                    assert(tokens.shift().type == TokenTypes.CLOSE_BRACKET);
                    ref = new Reference(ref, exp);
                break;

                default:
                    return ref;
            }             
        }
    };
}.call(this));
