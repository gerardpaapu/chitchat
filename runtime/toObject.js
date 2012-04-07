var NULL = (require('./builtins/Null.js').Null)(),
    classString = require('./classString.js'),
    slice = Array.prototype.slice,
    toObject;

toObject = exports.toObject = function (val) {
    // Described in ECMA-262: Section 9.9
    if (val == null) return NULL;

    switch (classString(val)) {
        case "Boolean":
        case "String":
        case "Number":
            return Object(val);

        case "Arguments":
            return slice.call(val);

        default:
            return val;
    }
};
