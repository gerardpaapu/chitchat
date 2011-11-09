(function () {
    var OBJECT, Dummy;
    OBJECT = CHITCHAT.builtins.Object = function () {};
    Dummy = function () {};

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
    OBJECT.prototype['=='] = function (obj) { return this == obj; };
    OBJECT.prototype['==='] = function (obj) { return this === obj; };
    OBJECT.prototype['!='] = function (obj) { return this != obj; };
    OBJECT.prototype['!=='] = function (obj) { return this !== obj; };
    OBJECT.prototype['>'] = function (obj) { return this > obj; };
    OBJECT.prototype['<'] = function (obj) { return this < obj; };
    OBJECT.prototype['>='] = function (obj) { return this >= obj; };
    OBJECT.prototype['<='] = function (obj) { return this <= obj; };

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
    OBJECT.prototype['&&'] = function (obj) { return this && obj; };
    OBJECT.prototype['||'] = function (obj) { return this || obj; };
    OBJECT.prototype['!'] = function () { return !this; };
    
    // Bitwise 
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
}());
