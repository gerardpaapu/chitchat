(function () {
    var CHITCHAT, REGEXP;

    if (typeof require == 'function') {
        CHITCHAT = require('./chitchat.js').CHITCHAT;
    } else if (typeof window != 'undefined' && window.CHITCHAT) {
        CHITCHAT = window.CHITCHAT;
    }

    REGEXP = CHITCHAT.builtins.RegExp = function () {};
}.call(null));

