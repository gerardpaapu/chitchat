var CHITCHAT = CHITCHAT || {};
(function () {
    CHITCHAT.builtins = CHITCHAT.builtins || {};
    var FUNCTION = CHITCHAT.builtins.Function = function (foo) {
        return function () {
            return foo;
        };
    };

    FUNCTION.prototype.extend = function () {};

    FUNCTION.prototype.doTimes = function () {};

    FUNCTION.prototype.bind = function () {};

    FUNCTION.prototype.curry = function () {};

    FUNCTION.prototype.curryRight = function () {};

    FUNCTION.prototype.compose = function () {};
}.call(this));
