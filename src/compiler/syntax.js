exports.Token = function (type, location, value) {
    this.type = type;
    this.location = location;
    this.value = value;
};

exports.Syntax = function (span, value) {
    this.location = span;
    this.value = value;
};

var Span = function (start, end) {
    this.start = start;
    this.end = end;
};

exports.Span = Span;

Span.over = function (a, b) {
    return new Span(a.start, b.end);
};

Span.prototype.toString = function () {
    return '(' + this.start + ', ' + this.end + ')';
};
