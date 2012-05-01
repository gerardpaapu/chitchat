var classString = require('../runtime/classString.js').classString,
    Symbol = require('./symbol.js').Symbol,
    assert = require('assert');

exports.Token = function (type, location, value) {
    this.type = type;
    this.location = location;
    this.value = value;
};

var Syntax = function (span, value) {
    if (!span) {
        throw new Error('No location given');
    }

    if (value == null) {
        throw new Error('No value given');
    }

    var isSymbol = value instanceof Symbol;

    this.location = span;
    this.value = isSymbol ? value.value : value;
    this.type = isSymbol ? 'Symbol' : classString(value);

    if (isSymbol) {
        this.escapedValue = value.toJSSymbol();
    }
};

Syntax.prototype.toString = function () {
    return 'Syntax<' + this.type + '> @ ' + this.location;
};

exports.Syntax = Syntax;

var SourceLocation = function (character, row, column) {
    this.character = character;
    this.row = row;
    this.column = column;
};

SourceLocation.prototype.toString = function () {
    return 'L' + this.row + ' C' + this.column;
};

SourceLocation.from = function (string, char) {
    var src = string.slice(0, char),
        last_line = /\n[^\n]*$/.exec(src)[0],
        new_lines = src.replace(/[^\n]/g, ''),
        loc = new SourceLocation();

    loc.character = char;
    loc.column = last_line.length + 1;
    loc.row = new_lines.length + 1;

    return loc;
};

exports.SourceLocation = SourceLocation;

var Span = function (start, end) {
    this.start = start;
    this.end = end;
};

exports.Span = Span;
Span.prototype.toString = function () {
    return '(' + this.start + ', ' + this.end + ')';
};

Span.over = function (a, b) {
    return new Span(a.start, b.end);
};

Span.at = function (str, start, end) {
    assert.equal(classString(str), 'String');
    assert.equal(classString(start), 'Number');
    assert.equal(classString(end), 'Number');

    return new Span(SourceLocation.from(str, start),
                    SourceLocation.from(str, end));
};

Span.prototype.toString = function () {
    return '(' + this.start + ' -- ' + this.end + ')';
};

