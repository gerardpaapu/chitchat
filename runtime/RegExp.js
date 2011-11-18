(function () {
    var CHITCHAT, REGEXP;

    if (typeof require == 'function') {
        CHITCHAT = require('./chitchat.js').CHITCHAT;
    } else if (typeof window != 'undefined' && window.CHITCHAT) {
        CHITCHAT = window.CHITCHAT;
    }

    REGEXP = CHITCHAT.builtins.RegExp = function () {};
    REGEXP.prototype = new RegExp();
    REGEXP.implement = function (key, value) {
        REGEXP.prototype[key] = value;
        return this;
    };
}.call(null));

