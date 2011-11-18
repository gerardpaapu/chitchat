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
    STRING.prototype = new String();
    STRING.implement = function (key, value) {
        STRING.prototype[key] = value;
        return this;
    };
}.call(this));
