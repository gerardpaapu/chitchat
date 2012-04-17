var MATH = exports.Math = {};
MATH.randomInteger = function (a, b) {
    var min, max = a;
    if (arguments.length > 1) {
        min = a;
        max = b;
    }

    return Math.floor(Math.random() * (max - min)) + min;
};
