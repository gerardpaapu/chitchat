CHITCHAT.ParseTypes.FunctionExpression.prototype.compile = function () {
    // 
};

CHITCHAT.ParseTypes.DictionaryLiteral.prototype.compile = function () {

};

CHITCHAT.ParseTypes.ArrayLiteral.prototype.compile = function () {
    return '[' + this.values.map(function (v) { return v.compile(); }).join(', ') + ']';
};

CHITCHAT.ParseTypes.NumberLiteral.prototype.compile = function () {
    return JSON.stringify(this.value);
};

CHITCHAT.ParseTypes.StringLiteral.prototype.compile = function () {
    return JSON.stringify(this.value);
};
