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

    /*
    ARRAY.prototype.map = function () {};

    ARRAY.prototype.forEach = function () {};

    ARRAY.prototype.reduce = function () {};

    ARRAY.range = function () { };
    */
}.call(this));
