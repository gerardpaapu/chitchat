(function () {
    var CHITCHAT, NUMBER;

    if (typeof require == 'function') {
        CHITCHAT = require('./chitchat.js').CHITCHAT;
    } else if (typeof window != 'undefined' && window.CHITCHAT) {
        CHITCHAT = window.CHITCHAT;
    }

    NUMBER = CHITCHAT.builtins.Number = function (obj) { 
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

    NUMBER.prototype['zero?'] = function (obj) {
        return this.valueOf() === 0;
    };

    // Bitwise 
    /*jshint bitwise: false */
    /*
    NUMBER.prototype['&'] = function (obj) { return this & obj; };
    NUMBER.prototype['|'] = function (obj) { return this | obj; };
    NUMBER.prototype['^'] = function (obj) { return this ^ obj; };
    NUMBER.prototype['>>'] = function (obj) { return this >> obj; };
    NUMBER.prototype['<<'] = function (obj) { return this << obj; };
    NUMBER.prototype['>>>'] = function (obj) { return this >>> obj; };
    NUMBER.prototype['~'] = function () { return ~this; };
    */
}.call(null));
