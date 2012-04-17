var REGEXP = exports.RegExp = function () {
    RegExp.apply(this, arguments);
};

REGEXP.prototype = Object.create(RegExp.prototype);
REGEXP.implement = function (key, value) {
    REGEXP.prototype[key] = value;
    return this;
};
