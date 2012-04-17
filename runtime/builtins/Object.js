var OBJECT, Dummy, respondsTo, capitalize, valueOf, classString, passMessage, Null;

passMessage = require('../passMessage.js').passMessage;
respondsTo = require('../passMessage.js').respondsTo; 
valueOf = require('../valueOf.js').valueOf;
Null = require('./Null.js').Null;
classString = require('../classString.js').classString;
OBJECT = exports.Object = function () {};
Dummy = function () {};

OBJECT.implement = function (key, value) {
    OBJECT.prototype[key] = value;
    return this;
};

OBJECT.prototype.clone = function () {
    Dummy.prototype = this;
    return new Dummy();
};

OBJECT.prototype.keys = function () {
    var key, result = [];

    for (key in this) {
        if (this.hasOwnProperty(key)) {
            result.push(key);
        }
    }

    return result;
};

// Comparison
OBJECT.prototype['=='] = function (obj) { return valueOf(this) == valueOf(obj); };
OBJECT.prototype['==='] = function (obj) { return valueOf(this) === valueOf(obj); };
OBJECT.prototype['!='] = function (obj) { return valueOf(this) != valueOf(obj); };
OBJECT.prototype['!=='] = function (obj) { return valueOf(this) !== valueOf(obj); };
OBJECT.prototype['>='] = function (obj) { return valueOf(this) >= valueOf(obj); };
OBJECT.prototype['<='] = function (obj) { return valueOf(this) <= valueOf(obj); };
OBJECT.prototype['>'] = function (obj) { return this > obj; };
OBJECT.prototype['<'] = function (obj) { return this < obj; };

// Arithmetic
// ----------
// The variable arity versions of these are implemented on
// more specific classes: Number and String
OBJECT.prototype['+'] = function (obj) { return this + obj; };
OBJECT.prototype['-'] = function (obj) { return this - obj; };
OBJECT.prototype['*'] = function (obj) { return this * obj; };
OBJECT.prototype['/'] = function (obj) { return this / obj; };
OBJECT.prototype['%'] = function (obj) { return this % obj; };

// Logical
OBJECT.prototype['&&'] = Object.prototype.and = function (obj) { return valueOf(this) && valueOf(obj); };
OBJECT.prototype['||'] = Object.prototype.or = function (obj) { return valueOf(this) || valueOf(obj); };
OBJECT.prototype['!'] = Object.prototype.not = function () { return !valueOf(this); };
OBJECT.prototype['false?'] = function () { return valueOf(this) === false; };
OBJECT.prototype['true?'] = function () { return valueOf(this) === true; };

// Bitwise 
/*jshint bitwise: false */
OBJECT.prototype['&'] = function (obj) { return this & obj; };
OBJECT.prototype['|'] = function (obj) { return this | obj; };
OBJECT.prototype['^'] = function (obj) { return this ^ obj; };
OBJECT.prototype['>>'] = function (obj) { return this >> obj; };
OBJECT.prototype['<<'] = function (obj) { return this << obj; };
OBJECT.prototype['>>>'] = function (obj) { return this >>> obj; };
OBJECT.prototype['~'] = function () { return ~this; };

// Special
OBJECT.prototype.has = function (obj) { return obj in this; };
OBJECT.prototype['typeof'] = function () { return typeof this; };
OBJECT.prototype['instanceof'] = function (Constructor) { return this instanceof Constructor; };
OBJECT.prototype['delete'] = function (key) { delete this[key]; return this; };

// Properties
capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

OBJECT.prototype.respondsTo = function (key) {
    return respondsTo(this, key);
};

OBJECT.prototype.get = function (key) {
    if (classString(key) === 'Number' && respondsTo(this, 'nth')) 
        return passMessage(this, 'nth', [key]);

    var accessor = 'get' + capitalize(key); 
    if (respondsTo(this, accessor)) 
        return passMessage(this, accessor, [key]);

    return this[key]; 
};

OBJECT.prototype.set = function (key, value) {
    if (classString(key) === 'Number' && respondsTo(this, 'setNth'))
        return passMessage(this, 'setNth', [key, value]);

    var setter = 'set' + capitalize(key);
    if (respondsTo(this, setter)) 
        return passMessage(this, setter, [key, value]);

    return (this[key] = value);
};

OBJECT.prototype['array?'] = function () { return classString(this) === 'Array'; };
OBJECT.prototype['boolean?'] = function () { return classString(this) === 'Boolean'; };
OBJECT.prototype['date?'] = function () { return classString(this) === 'Date'; };
OBJECT.prototype['error?'] = function () { return classString(this) === 'Error'; };
OBJECT.prototype['function?'] = function () { return classString(this) === 'Function'; };
OBJECT.prototype['null?'] = function () { return this instanceof Null; };
OBJECT.prototype['number?'] = function () { return classString(this) === 'Number'; };
OBJECT.prototype['regexp?'] = function () { return classString(this) === 'RegExp'; };
OBJECT.prototype['string?'] = function () { return classString(this) === 'String'; };
