(function () {
    var CHITCHAT, MATH;

    if (typeof require == 'function') {
        CHITCHAT = require('./chitchat.js').CHITCHAT;
    } else if (typeof window != 'undefined' && window.CHITCHAT) {
        CHITCHAT = window.CHITCHAT;
    }

    MATH = CHITCHAT.builtins.Math = {};
    MATH.randomInteger = function (a, b) {
        var min, max = a;
        if (arguments.length > 1) {
            min = a;
            max = b;
        }

        return Math.floor(Math.random() * (max - min)) + min;
    };
}.call(null));
