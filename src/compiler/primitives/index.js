var extend = function (dest, src) {
    for (var key in src) {
        dest[key] = src[key];
    }
};

extend(exports, require('./throwers.js'));
extend(exports, require('./literals.js'));
extend(exports, require('./functions.js'));
extend(exports, require('./class.js'));
extend(exports, require('./conditionals.js'));
extend(exports, require('./let.js'));
extend(exports, require('./accessors.js'));
