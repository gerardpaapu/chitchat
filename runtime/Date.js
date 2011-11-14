(function () {
    var CHITCHAT, DATE, instance;

    if (typeof require == 'function') {
        CHITCHAT = require('./chitchat.js').CHITCHAT;
    } else if (typeof window != 'undefined' && window.CHITCHAT) {
        CHITCHAT = window.CHITCHAT;
    }

    DATE = CHITCHAT.builtins.Date = function () {
        return Date.apply(this, arguments); 
    };
    DATE.prototype = new Date();

}.call(null));
