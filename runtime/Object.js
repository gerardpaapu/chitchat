(function () {
    var CHITCHAT, OBJECT, Dummy, respondsTo, capitalize, valueOf;

    if (typeof require == 'function') {
        CHITCHAT = require('./chitchat.js').CHITCHAT;
    } else if (typeof window != 'undefined' && window.CHITCHAT) {
        CHITCHAT = window.CHITCHAT;
    }

    OBJECT = CHITCHAT.builtins.Object = function () {};
    valueOf = CHITCHAT.valueOf;
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
    respondsTo = function (receiver, selector) {
        return CHITCHAT.getImplementation(receiver, selector) != null; 
    };

    capitalize = function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    OBJECT.prototype.respondsTo = function (key) {
        return respondsTo(this, key);
    };

    OBJECT.prototype.get = function (key) {
        if (CHITCHAT.type(key) === 'Number' && respondsTo(this, 'nth')) 
            return CHITCHAT.passMessage(this, 'nth', [key]);

        var accessor = 'get' + capitalize(key); 
        if (respondsTo(this, accessor)) 
            return CHITCHAT.passMessage(this, accessor, [key]);

        return this[key]; 
    };

    OBJECT.prototype.set = function (key, value) {
        if (CHITCHAT.type(key) === 'Number' && respondsTo(this, 'setNth'))
            return CHITCHAT.passMessage(this, 'setNth', [key, value]);

        var setter = 'set' + capitalize(key);
        if (respondsTo(this, setter)) 
            return CHITCHAT.passMessage(this, setter, [key, value]);

        return (this[key] = value);
    };


    OBJECT.prototype['array?'] = function () { return CHITCHAT.type(this) === 'Array'; };
    OBJECT.prototype['boolean?'] = function () { return CHITCHAT.type(this) === 'Boolean'; };
    OBJECT.prototype['date?'] = function () { return CHITCHAT.type(this) === 'Date'; };
    OBJECT.prototype['error?'] = function () { return CHITCHAT.type(this) === 'Error'; };
    OBJECT.prototype['function?'] = function () { return CHITCHAT.type(this) === 'Function'; };
    OBJECT.prototype['null?'] = function () { return this instanceof CHITCHAT.builtins.Null; };
    OBJECT.prototype['number?'] = function () { return CHITCHAT.type(this) === 'Number'; };
    OBJECT.prototype['regexp?'] = function () { return CHITCHAT.type(this) === 'RegExp'; };
    OBJECT.prototype['string?'] = function () { return CHITCHAT.type(this) === 'String'; };
}());
