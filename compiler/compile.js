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
        case 'number':
        case 'string':
            return JSON.stringify(tree);

        case 'array':
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

    if (type(message) == 'array' &&
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

    'function': function (args) {
        var tail = arguments.length < 2 ? null : arguments[arguments.length - 1],
            body = arguments.length < 3 ? null : slice(arguments, 1, -1),
            template, arg_s, body_s, tail_s;

        arg_s = args.map(function (arg) {
            assert.ok(arg instanceof Symbol);
            return compileSymbol(arg);
        }).join(', ');

        body_s = body && body.map(function (e) {
            return compile(e) + ';\n';
        }).join(' ');

        tail_s = tail && compile(tail);

        template = body ? 'function ($0) {\n$1return$2;\n}'
        : tail ? 'function ($0) { return $2; }'
        : 'function ($0){}';

        return format(template, arg_s, body_s, tail_s || ''); 
    },

    '#ARRAY': function () {
        return '[' + slice(arguments).map(compile).join(', ') + ']';
    },

    '#DICT': function () {
        var args = slice(arguments), max = args.length, i, expr;

        if (max % 2 !== 0) throw new SyntaxError(); 

        expr = '{';
        
        for (i = 0; i < max; i += 2) {
            expr += format('"$0": $1', args[i].value, compile(args[i + 1]));
        }

        expr += '}';

        return expr;
    },

    '#MSG': function () {
        throw new SyntaxError();
    },

    'var': function () {
        throw new SyntaxError();
    }
};

slice = function (arr, a, b) {
    return Array.prototype.slice.call(arr, a, b);
};

type = function (obj) {
    return obj == null ? String(obj)
    :  Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
};

format = function (template) {
    var values = slice(arguments, 1);
    return template.replace(/\$(\d+)/g, function (_, n) {
        return values[n];
    }); 
};
