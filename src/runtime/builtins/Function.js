var FUNCTION = function (foo) {
    return function () {
        return foo;
    };
};

exports.Function = FUNCTION;

FUNCTION.prototype = function (){};

FUNCTION.implement = function (key, value) {
    FUNCTION.prototype[key] = value;
    return this;
};

FUNCTION.prototype.implement = function (key, value) {
    this.prototype[key] = value;
    return this;
};

/*
FUNCTION.prototype.doTimes = function () {};

FUNCTION.prototype.bind = function () {};

FUNCTION.prototype.curry = function () {};

FUNCTION.prototype.curryRight = function () {};

FUNCTION.prototype.compose = function () {};
*/

var Dummy = function () {};

FUNCTION.prototype['new'] = function () {
    var instance, result;

    Dummy.prototype = this.prototype; 
    instance = new Dummy();
    result = this.apply(instance, arguments);

    return result != null ? result : instance;
};
