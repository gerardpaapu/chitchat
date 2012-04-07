var NULL = new (require('./builtins/Null.js').Null)();

// Returns a canonical version of an object
// for equality, comparison and truthiness
// because in javascript the following facts
// are mental:
//
//  - Object(3) != 3 
//  - !Object(false) == false
// 
exports.valueOf = function valueOf(val) {
    // Described in ECMA-262: Section 9.9
    if (val == null || val === NULL) {
        return null;
    }

    switch (typeof(val)) {
        case "boolean":
        case "string":
        case "number":
            return Object(val).valueOf();

        default:
            return val;
    }
};
