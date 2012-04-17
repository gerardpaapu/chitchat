/*jshint eqnull:true */
var classString = require('./classString.js').classString,
    toObject = require('./toObject').toObject,
    valueOf = require('./valueOf.js').valueOf,
    builtins = require('./builtins/index.js'),
    passMessage,
    respondsTo,
    getImplementation,
    isFunction,
    getShimForClass, 
    getShimForValue;

passMessage = exports.passMessage = function (receiver, selector, args) {
    // If the receiver is null we coerce it to CHITCHAT.NULL_INSTANCE
    // So that we can still pass it a message
    receiver = toObject(receiver);
    
    // The implementation is the concrete method that will handle the message
    // all the smoke and mirrors occur within `getImplementation`
    var implementation = getImplementation(receiver, selector);

    if (implementation != null) {
        return implementation.apply(receiver, args);
    }

    if (selector !== 'methodMissing') {
        return passMessage(receiver, 'methodMissing', [selector].concat(args));
    }

    throw new Error('methodMissing implementation not found');
};

respondsTo = exports.respondsTo = function (receiver, selector) {
    return getImplementation(receiver, selector) != null;
};

getImplementation = function (receiver, selector) {
    var valueShim, classShim;

    if (selector in receiver) {
        return isFunction(receiver[selector]) ? receiver[selector]
            : function () { return this[selector]; };
    }

    valueShim = getShimForValue(receiver);
    if (valueShim && selector in valueShim) {
        return valueShim[selector];
    }

    classShim = getShimForClass(receiver);
    if (classShim && selector in classShim.prototype) {
        return classShim.prototype[selector];
    }

    if (selector in builtins.Object.prototype) {
        return builtins.Object.prototype[selector]; 
    }

    return null;
};

getShimForValue = function (NativeClass) {
    switch (NativeClass) {
        case Array: return builtins.Array;
        case Boolean: return builtins.Boolean;
        case Date: return builtins.Date;
        case Error: return builtins.Error;
        case Function: return builtins.Function;
        case Math: return builtins.Math;
        case Number: return builtins.Number;
        case Object: return builtins.Object;
        case RegExp: return builtins.RegExp;
        case String: return builtins.String;
        default: return null;
    } 
};

getShimForClass = function (value) {
    return builtins[ classString(value) ] || builtins.Object;
};

isFunction = function (obj) {
    return classString(obj) === 'Function';
};
