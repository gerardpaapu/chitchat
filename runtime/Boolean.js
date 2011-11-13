/*globals CHITCHAT */
(function () {
    var CHITCHAT, BOOLEAN;

    if (typeof require == 'function') {
        CHITCHAT = require('./chitchat.js').CHITCHAT;
    } else if (typeof window != 'undefined' && window.CHITCHAT) {
        CHITCHAT = window.CHITCHAT;
    }

    BOOLEAN = CHITCHAT.builtins.Boolean = function () {};
}.call(null));
