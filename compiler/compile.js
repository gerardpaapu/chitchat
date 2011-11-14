/*jshint eqnull: true */
var compile, compileList, compileSymbol, keywords, format, type, slice, compileMessage,

    R = require('./reader.js'),
    read = R.read,
    Symbol = R.Symbol,

    assert = require('assert');

exports.compile = function (str) {
    return compile(read(str));
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
    if (list.length < 2) throw new SyntaxError();

    if (list[0] instanceof Symbol &&
        list[0].value in keywords) {
        return keywords[list[0].value].apply(null, list.slice(1));
    }

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
        return format('$0?$1:$2',
                      compile(test),
                      compile(true_branch),
                      compile(false_branch));
    },

    'function': function (args/*, body..., tail*/) {
        var _body = slice(arguments, 1),
            body = [], vars = [], tail = null,
            arg_s, vars_s, body_s, tail_s,
            i, expr;

        arg_s = args.map(function (arg) {
            assert.ok(arg instanceof Symbol);
            return compileSymbol(arg);
        }).join(', ');

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

        return format('function ($0) {\n$1$2return$3;\n}', arg_s, vars_s, body_s, tail_s); 
    },

    '#ARRAY': function () {
        return '[' + slice(arguments).map(compile).join(', ') + ']';
    },

    '#DICT': function () {
        var args = slice(arguments), max, i, expr;

        if (max % 2 !== 0) throw new SyntaxError(); 

        for (i = 0, max = args.length, expr = ''; i < max; i += 2) {
            expr += format('"$0": $1', args[i].value, compile(args[i + 1]));
        }

        return format('{$0}', expr);
    },

    '#MSG': function () {
        throw new SyntaxError();
    },

    'var': function () {
        throw new SyntaxError();
    },

    'set!': function (place, value) {
        var obj, msg, key;

        if (place instanceof Symbol) {
            return format('$0 = $1', compile(place), compile(value));
        }

        assert.equal(type(place), 'Array');

        assert.equal(place.length, 2);
        obj = place[0];
        msg = place[1];
        key = (msg instanceof Symbol) ? msg.value : compile(msg[1]); 

        return format('$0["$1"] = $2', compile(obj), key, compile(value));
    }
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
