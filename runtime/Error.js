(function () {
    var CHITCHAT, ERROR, instance;

    if (typeof require == 'function') {
        CHITCHAT = require('./chitchat.js').CHITCHAT;
    } else if (typeof window != 'undefined' && window.CHITCHAT) {
        CHITCHAT = window.CHITCHAT;
    }

    ERROR = CHITCHAT.builtins.Error = function () {
        return Error.apply(this, arguments);
    };
    ERROR.prototype = new Error();

}.call(null));
