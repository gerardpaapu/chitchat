var ARRAY = function () {
    Array.apply(this, arguments);
};
exports.Array = ARRAY;
ARRAY.prototype = Object.create(Array.prototype);
ARRAY.prototype.nth = function (n) { return this[n]; };

ARRAY.implement = function (key, value) {
    ARRAY.prototype[key] = value;
    return this;
};

ARRAY.range = function (a, b, c) {
    var start = 0, stop = 0, step = 1, result = [], i;
    switch (arguments.length) {
        case 0: return [];
        case 1:
            stop = a;
            break;

        case 2:
            start = a;
            stop = b;
            break;

        case 3:
            start = a;
            stop = b;
            step = c;
    }

    for (i = start; i < stop; i++) {
        result.push(i);
    }

    return result;
};
ARRAY.prototype.nth = function (n) { return this[n]; };

ARRAY.prototype.shuffled = function () {
    if (this.length === 0) return [];

    var i, j, dest = new Array(this.length);

    dest[0] = this[0];

    for (i = 1; i < this.length; i++) {
        j = Math.floor(Math.random() * (i + 1));
        dest[i] = dest[j];
        dest[j] = this[i];
    }

    return dest;
};
