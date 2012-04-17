var ERROR = function () {
    Error.apply(this, arguments);
};
exports.Error = ERROR;
ERROR.prototype = Object.create(Error.prototype);
ERROR.implement = function (key, value) {
    ERROR.prototype[key] = value;
    return this;
};
