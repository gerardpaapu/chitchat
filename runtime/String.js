(function () {
    var CHITCHAT, STRING;

    if (typeof require == 'function') {
        CHITCHAT = require('./chitchat.js').CHITCHAT;
    } else if (typeof window != 'undefined' && window.CHITCHAT) {
        CHITCHAT = window.CHITCHAT;
    }

    STRING = CHITCHAT.builtins.String = function (obj) {
        return String(obj);
    };
}.call(this));