(function () {
    /*jshint eqnull: true */
    var passMessage, getImplementation, defaults, type, isFunction, getShimForClass, getShimForValue, NULL, CHITCHAT;

    if (typeof require == 'function') {
        CHITCHAT = require('./chitchat.js').CHITCHAT;
    } else if (typeof window != 'undefined' && window.CHITCHAT) {
        CHITCHAT = window.CHITCHAT;
    }

    NULL = new CHITCHAT.builtins.Null();

    CHITCHAT.passMessage = passMessage = function (receiver, selector, args) {
        // If the receiver is null we coerce it to CHITCHAT.NULL_INSTANCE
        // So that we can still pass it a message
        receiver = (receiver != null) ? receiver : NULL;
        //
        // The implementation is the concrete method that will handle the message
        // all the smoke and mirrors occur within `getImplementation`
        var implementation = getImplementation(receiver, selector);

        switch (true) {
            case implementation != null:
                return implementation.apply(receiver, args);

            case selector != 'methodMissing':
                return passMessage(receiver, 'methodMissing', [selector].concat(args));

            default:
                throw new Error('methodMissing implementation not found');
        }
    };

    CHITCHAT.getImplementation = getImplementation = function (receiver, selector) {
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

        if (selector in CHITCHAT.builtins.Object) {
            return CHITCHAT.builtins.Object[selector]; 
        }

        return null;
    };

    CHITCHAT.type = type = function (obj) {
        return obj === this ? 'Global'
            :  obj === undefined ? 'Undefined'
            :  obj === null || obj === CHITCHAT.NULL ? 'Null'
            :  Object.prototype.toString.call(obj).slice(8, -1); 
    };

    CHITCHAT.getShimForValue = getShimForValue = function (NativeClass) {
        switch (NativeClass) {
            case Array: return CHITCHAT.builtins.Array;
            case Boolean: return CHITCHAT.builtins.Boolean;
            case Date: return CHITCHAT.builtins.Date;
            case Error: return CHITCHAT.builtins.Error;
            case Function: return CHITCHAT.builtins.Function;
            case Math: return CHITCHAT.builtins.Math;
            case Number: return CHITCHAT.builtins.Number;
            case Object: return CHITCHAT.builtins.Object;
            case RegExp: return CHITCHAT.builtins.RegExp;
            case String: return CHITCHAT.builtins.String;
            default: return null;
        } 
    };
    
    CHITCHAT.getShimForClass = getShimForClass = function (value) {
        return CHITCHAT.builtins[ type(value) ] || CHITCHAT.builtins.Object;
    };

    isFunction = function (obj) {
        return type(obj) === 'Function';
    };
}.call(this));
