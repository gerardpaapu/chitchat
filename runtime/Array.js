(function () {
    var CHITCHAT, ARRAY;

    if (typeof require == 'function') {
        CHITCHAT = require('./chitchat.js').CHITCHAT;
    } else if (typeof window != 'undefined' && window.CHITCHAT) {
        CHITCHAT = window.CHITCHAT;
    }

    ARRAY = CHITCHAT.builtins.Array = function (obj) {
        return new Array(obj);
    };

    ARRAY.prototype.nth = function (n) { return this[n]; };
    /*
    ARRAY.prototype.map = function () {};

    ARRAY.prototype.forEach = function () {};

    ARRAY.prototype.reduce = function () {};
    */

    ARRAY.range = function (a, b, c) {
        var start = 0, stop = 0, step = 1, result = [], i;
        switch (arguments.length) {
            case 0: return [];
            case 1:
                stop = a;
                break;

            case 2:
                start = a;
                stop = b;
                break;

            case 3:
                start = a;
                stop = b;
                step = c;
        }

        for (i = start; i < stop; i++) {
            result.push(i);
        }

        return result;
    };
}.call(this));
