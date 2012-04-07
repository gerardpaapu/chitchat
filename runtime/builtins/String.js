var STRING = exports.String = function (obj) {
    return String(obj);
};
STRING.prototype = Object.create(String.prototype);
STRING.implement = function (key, value) {
    STRING.prototype[key] = value;
    return this;
};
