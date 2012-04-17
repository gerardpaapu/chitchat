var GLOBAL = this,
    NULL = new (require('./builtins/Null.js').Null)(),
    _toString = Object.prototype.toString,
    classString;

classString = exports.classString = function (obj) {
    switch (obj) {
        case GLOBAL:
            return 'Global';

        case (void 0):
            return 'Undefined';

        case null:
        case NULL: return 'Null';

        default:
            return _toString.call(obj).slice(8, -1); 
    }
};
