var shared_keywords,
    javascript_reserved,
    chitchat_reserved,
    escape_map,
    unescape_map,
    escapeSymbol,
    unescapeSymbol,
    assert = require('assert'),
    Symbol;

Symbol = function  (value, skip_test) {
    if (!skip_test) {
        assert.ok(Symbol.isLegalValue(value),
                  'value is a legal chitchat symbol: ' + value);
    }
    this.value = value;
};

exports.Symbol = Symbol;

Symbol.prototype.toJSSymbol = function () {
    return escapeSymbol(this.value);
};

Symbol.fromJSSymbol = function (src) {
    return new Symbol( unescapeSymbol(src) );
};

Symbol.isLegalValue = function (value) {
    var glyphs = '_-+=$&%@!?~`<>:|',
        letters = 'abcdefghijklmnopqrsutvwxyz',
        digits = '1234567890',
        prefix = glyphs + letters + letters.toUpperCase(),
        all = prefix + digits,
        ch, i;

    if (value.length === 0) {
        return false;
    }

    ch = value[0];

    if (prefix.indexOf(ch) === -1) {
        return false;
    }

    i = 1;
    while (i < value.length) {
        ch = value[i++];
        if (all.indexOf(ch) === -1) {
            return false;
        }
    }

    return true;
};

// the following are keywords in chitchat and javascript
// so will be returned as-is
shared_keywords = ["this", "null", "true", "false"];

// these words may not be used as identifiers in
// javascript as specified in ecma-262 7.6
javascript_reserved = [
    'break', 'case', 'catch', 'continue', 'debugger',
    'default', 'delete', 'do', 'else', 'finally', 'for',
    'function', 'if', 'in', 'instanceof', 'new', 'return',
    'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void',
    'while', 'with', 'class', 'enum', 'extends', 'super',
    'const', 'export', 'import', 'null', 'true', 'false'
];

// these are the legal components of symbols in chitchat
// - glyphs  '_-+=$&%@!?~`<>:|'
// - letters 'abcdefghijklmnopqrsutvwxyz'
// - digits  '1234567890'
//
// a symbol in chitchat is a glyph or letter followed by zero or more glyphs, letters, and numbers
// an identifier can be any symbol that isn't a reserved word in chitchat.
//
// these are the legal components of symbols in javascript
// - glyphs '_$'
// - letters 'absdefghijklmnopqrstuvwxyz'
// - digits '1234567890'
//
// because of this mismatch, the following characters must be escaped '-+=&%@!?~`<>:|'
escape_map = {
    '_': 'underscore',
    '-': 'dash',
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
    '|': 'or'
};

unescape_map = {
    '_underscore_': '_',
    '_dash_': '-',
    '_plus_': '+',
    '_equal_': '=',
    '_and_': '&',
    '_modulo_': '%',
    '_at_': '@',
    '_bang_': '!',
    '_question_': '?',
    '_tilde_': '~',
    '_grave_': '`',
    '_less_': '<',
    '_greater_': '>',
    '_or_': '|'
};

unescapeSymbol = function (src) {
    var result = '', i = 0, next, max, ch, key;

    if (src.slice(0, 2) === '_$') {
        // if the reserved word prefix is present
        // discard it
        src = src.slice(2);
    }

    while (i < src.length) {
        ch = src.charAt(i);
        // '_' is the the beginning of an escape sequence
        if (ch === '_') {
            // read to the next '_' for
            // the entire escape sequence
            next = src.indexOf('_', i + 1) + 1;
            key = src.slice(i, next);
            
            assert.ok(key in unescape_map,
                      key + ' must be valid escape sequence');
            result += unescape_map[key];

            // move past the escape sequence
            i = next;
        } else {
            result += ch;
            i++;
        }
    }

    return result;
};

escapeSymbol = function (src) {
    if (shared_keywords.indexOf(src) !== -1)
        return src;

    var result = '', i, max, ch;

    for (i = 0, max = src.length; i < max; i++) {
        ch = src.charAt(i);
        if (ch in escape_map) {
            result += '_' + escape_map[ch] + '_';
        } else {
            result += ch;
        }
    }

    if (javascript_reserved.indexOf(result) !== -1) {
        return '_$' + result;
    } else {
        return result;
    }
};
