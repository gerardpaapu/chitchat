(function () {
    NUMBER = CHITCHAT.builtins.NUMBER = function (obj) { 
        return Number(obj); 
    }; 

    NUMBER.prototype['+'] = function () { 
        var total = this, i = arguments.length;

        while (i--) total += Number(arguments[i]);
        return total;
    };

    NUMBER.prototype['-'] = function (obj) {
        var total = this, i = arguments.length;

        while (i--) total -= Number(arguments[i]);
        return total;
    };

    NUMBER.prototype['*'] = function (obj) { 
        var total = this, i = arguments.length;

        while (i--) total *= Number(arguments[i]);
        return total;
    };

    NUMBER.prototype['/'] = function (obj) {
        var total = this, i = arguments.length;

        while (i--) total /= Number(arguments[i]);
        return total;
    };

    // Bitwise 
    OBJECT.prototype['&'] = function (obj) { return this & obj; };
    OBJECT.prototype['|'] = function (obj) { return this | obj; };
    OBJECT.prototype['^'] = function (obj) { return this ^ obj; };
    OBJECT.prototype['>>'] = function (obj) { return this >> obj; };
    OBJECT.prototype['<<'] = function (obj) { return this << obj; };
    OBJECT.prototype['>>>'] = function (obj) { return this >>> obj; };
    OBJECT.prototype['~'] = function () { return ~this; };
}.call(null));
