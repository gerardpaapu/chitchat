exports.Token = function (type, location, value) {
    this.type = type;
    this.location = location;
    this.value = value;
};

exports.Syntax = function (span, value) {
    this.span = span;
    this.value = value;
};

exports.Span = function (start, end) {
    this.start = start;
    this.end = end;
};
exports.Span.prototype.toString = function () {
    return '(' + this.start + ', ' + this.end + ')';
};
