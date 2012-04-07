var BOOLEAN = function () {
    Boolean.apply(this, arguments);
};
exports.Boolean = BOOLEAN;

BOOLEAN.implement = function (key, value) {
    BOOLEAN.prototype[key] = value;
    return this;
};
