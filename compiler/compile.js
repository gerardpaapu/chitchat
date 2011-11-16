/*jshint eqnull: true */
var compile, compileList, compileSymbol, keywords, format, type, slice, isMessage, compileMessage, compileFunctionBody, wrap,

    R = require('./reader.js'),
    read = R.read,
    readAll = R.readAll,
    Symbol = R.Symbol,

    assert = require('assert');

exports.compile = function (str) {
    return readAll(str).map(function (s){
        return compile(s) + ';';
    }).join('\n');
};

compile = function (tree) {
    switch (type(tree)) {
        case 'Number':
        case 'String':
            return JSON.stringify(tree);

        case 'Array':
            return compileList(tree);

        default:
            assert.ok(tree instanceof Symbol);

        return compileSymbol(tree);
    }
};

compileSymbol = function (symbol) {
    // The following are keywords in ChitChat AND javascript
    // so will be returned as-is
    var shared = ["this", "null", "true", "false"];

    if (shared.indexOf(symbol.value) != -1)
        return symbol.value;

    // These are the legal components of symbols in Chitchat
    // - glyphs  '_-+=$&%@!?~`<>:|'
    // - letters 'abcdefghijklmnopqrsutvwxyz'
    // - digits  '1234567890'
    //
    // A symbol in chitchat is a glyph or letter followed by zero or more glyphs, letters, and numbers
    // An Identifier can be any symbol that isn't a reserved word in Chitchat.
    //
    // These are the legal components of symbols in Javascript
    // - glyphs '_$'
    // - letters 'absdefghijklmnopqrstuvwxyz'
    // - digits '1234567890'
    //
    // Because of this mismatch, the following characters must be escaped '-+=&%@!?~`<>:|'
    var escapes, src, result, i, max, ch, reserved;
    escapes = {
        '_': '',
        '-': 'minus',
        '+': 'plus',
        '=': 'equal',
        '&': 'and',
        '%': 'modulo',
        '@': 'at',
        '!': 'bang',
        '?': 'question',
        '~': 'tilde',
        '`': 'grave',
        '<': 'less',
        '>': 'greater',
        ':': 'colon',
        '|': 'or'
    };

    src = symbol.value;
    result = '';

    for (i = 0, max = src.length; i < max; i++) {
        ch = src.charAt(i);
        if (ch in escapes) {
            result += '_' + escapes[ch] + '_';
        } else {
            result += ch;
        }
    }

    // These words may not be used as identifiers in
    // Javascript as specified in Ecma-262 7.6
    reserved = [
        'break', 'case', 'catch', 'continue', 'debugger', 
        'default', 'delete', 'do', 'else', 'finally', 'for', 
        'function', 'if', 'in', 'instanceof', 'new', 'return', 
        'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 
        'while', 'with', 'class', 'enum', 'extends', 'super', 
        'const', 'export', 'import', 'null', 'true', 'false'
    ];   

    if (reserved.indexOf(result) != -1) {
        return '_$' + result;
    } else {
        return result;
    }
};

compileList = function (list) {
    if (list[0] instanceof Symbol &&
        list[0].value in keywords) {
        return keywords[list[0].value].apply(null, list.slice(1));
    }

    if (list.length < 2) throw new SyntaxError();

    var args_str = list.slice(2).map(compile).join(', ');

    return format('CHITCHAT.passMessage($0, $1, [$2])',
                  compile(list[0]),
                  compileMessage(list[1]),
                  args_str);
};

compileMessage = function (message) {
    if (message instanceof Symbol) return compile(message.value);

    if (type(message) == 'Array' &&
        message[0].value == "#MSG")
        return compile(message[1]);

    throw new SyntaxError();
};

keywords = {
    'if': function (test, true_branch, false_branch) {
        var i, max, tail, result = '', args = slice(arguments);

        if (args.length < 2) throw new SyntaxError();

        if (args.length % 2 > 0) {
            max = args.length - 2;
            tail = compile(args[args.length - 1]);
        } else {
            max = args.length - 1;    
            tail = 'null';
        }

        for (i = 0; i < max; i += 2) {
            result += format('$0?$1:',
                             compile(args[i]),
                             compile(args[i + 1]));
        }

        result += tail;

        return result;
    },

    'function': function (args/*, body..., tail*/) {
        var arg_s, body_s;

        arg_s = args.map(function (arg) {
            assert.ok(arg instanceof Symbol);
            return compileSymbol(arg);
        }).join(', ');

        body_s = compileFunctionBody(slice(arguments, 1));

        return format('function ($0) {\n$1\n}', arg_s, body_s); 
    },

    '#ARRAY': function () {
        return '[' + slice(arguments).map(compile).join(', ') + ']';
    },

    '#DICT': function () {
        var args = slice(arguments), max = args.length, i, pairs = [];

        if (max % 2 !== 0) throw new SyntaxError(); 

        for (i = 0; i < max; i += 2) {
            pairs.push(format('"$0": $1', args[i].value, compile(args[i + 1])));
        }

        return format('{$0}', pairs.join(', '));
    },

    '#MSG': function () {
        throw new SyntaxError();
    },

    'var': function () {
        throw new SyntaxError();
    },

    'block': function () {
        return wrap(compileFunctionBody( slice(arguments) ));
    },

    'try': function (try_b, err, catch_b, finally_b) {
        var templates = [
            'try { return $0; } catch (err) { return null; }',
            'try { return $0; } catch ($1) { return $2; }',
            'try { $0 } catch ($1) { $2 } finally { return $3; }'
        ]; 

        switch (arguments.length) {
            case 0: case 2:
                throw new SyntaxError();

            case 1:
                return wrap(format(templates[0], compile(try_b)));

            case 3:
                assert.ok(err instanceof Symbol);
                return wrap(format(templates[1],
                              compile(try_b),
                              compileSymbol(err),
                              compile(catch_b)));

            case 4:
                assert.ok(err instanceof Symbol);
                return wrap(format(templates[2],
                              compile(try_b),
                              compileSymbol(err),
                              compile(catch_b),
                              compile(finally_b)));
        }
    },

    // set! and get! provide primitive access and assignment
    'set!': function (place, value) {
        // (set! (foo bar) baz)        -> foo['bar'] = baz
        // (set! (foo (#MSG bar)) baz) -> foo[bar] = baz
        var obj, msg;

        if (place instanceof Symbol) {
            return format('$0 = $1', compile(place), compile(value));
        }

        assert.equal(type(place), 'Array');
        assert.equal(place.length, 2);

        obj = place[0];
        msg = place[1];

        assert.ok(isMessage(msg));

        return format('$0[$1] = $2', compile(obj), compileMessage(msg), compile(value));
    },

    'get!': function (place) {
        // (get! (foo bar))        -> foo['bar']
        // (get! (foo (#MSG exp))) -> foo[exp]
        var obj, msg;

        assert.equal(type(place), 'Array');
        assert.equal(place.length, 2);
        assert.ok(isMessage(place[1]));

        obj = place[0];
        msg = place[1];

        return format('$0[$1]', compile(obj), compileMessage(msg));
    }
};

isMessage = function (expr) {
    return expr instanceof Symbol ||
           (type(expr) === 'Array' &&
            expr.length === 2 && 
            Symbol.MSG.equals(expr[0]) &&
            expr[1] instanceof Symbol);
};

compileMessage = function (msg) {
    return compile(msg instanceof Symbol ? msg.value : msg[1]); 
};

compileFunctionBody = function (_body) {
    var body = [], vars = [], tail = null,
        vars_s, body_s, tail_s, i, expr;

    for (i = 0; i < _body.length; i++) {
        expr = _body[i];

        if (type(expr) === 'Array' &&
            expr[0] instanceof Symbol &&
            expr[0].value === 'var') {

            [].push.apply(vars, _body[i].slice(1));
        } else {
            body.push(_body[i]);
        }
    }

    if (body.length > 0) {
        tail = body[body.length - 1];
        body = body.slice(0, -1);
    }

    vars_s = vars.length === 0 ? ''
        :  format('var $0;\n', vars.map(compileSymbol).join(', '));

    body_s = body.length === 0 ? '' : body.map(function (e) {
        return compile(e) + ';\n';
    }).join(' ');

    tail_s = tail ? ' ' + compile(tail) : '';

    return format('$0$1return$2;', vars_s, body_s, tail_s);
};

slice = function (arr, a, b) {
    return Array.prototype.slice.call(arr, a, b);
};

type = function (obj) {
    return obj == null ? String(obj)
    :  Object.prototype.toString.call(obj).slice(8, -1);
};

format = function (template) {
    var values = slice(arguments, 1);
    return template.replace(/\$(\d+)/g, function (_, n) {
        return values[n];
    }); 
};

wrap = function (body) {
    var template = "(function () {\n$0\n}.apply(this, (typeof arguments != 'undefined') ? arguments : []))";
    return format(template, body);
};
