var NULL = exports.Null = function () {
    if (instance == null) instance = this;
    return instance;
};

NULL.prototype.methodMissing = function () {
    return null;
};

NULL.extend = function (key, value) {
    NULL.prototype[key] = value;
    return this;
};
