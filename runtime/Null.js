(function () {
    var CHITCHAT, NULL, instance;

    if (typeof require == 'function') {
        CHITCHAT = require('./chitchat.js').CHITCHAT;
    } else if (typeof window != 'undefined' && window.CHITCHAT) {
        CHITCHAT = window.CHITCHAT;
    }

    NULL = CHITCHAT.builtins.Null = function () {
        if (instance == null) instance = this;
        return instance;
    };

    NULL.prototype.methodMissing = function () {
        return null;
    };
}.call(null));
