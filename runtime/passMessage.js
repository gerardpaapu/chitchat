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
        var fallback, OBJECT, ChitchatNative, implementation, accessor;

        ChitchatNative = getShimForClass(receiver);

        receiver = (selector in receiver) ? receiver
                :  (ChitchatNative && selector in ChitchatNative) ? ChitchatNative 
                :  null;

        if (receiver != null) {
            // The receiver has a property called 'selector', if it is a method return that.
            // otherwise generate an accessor and return that.
            implementation = receiver[selector];
            return isFunction(implementation) ? implementation : function () { return receiver[selector]; };
        }

        // The receiver doesn't have an implementation for this message
        // but we might have one in the shim for its native type    
        // or the shim for Object
        Fallback = getShimForValue(receiver);
        OBJECT = CHITCHAT.builtins.Object;

        return Fallback.prototype[selector] || OBJECT.prototype[selector] || null;
    };

    type = function (obj) {
        return obj === this ? 'Global'
            :  obj === undefined ? 'Undefined'
            :  obj === null || obj === CHITCHAT.NULL ? 'Null'
            :  Object.prototype.toString.call(obj).slice(8, -1); 
    };

    CHITCHAT.getShimForClass = getShimForClass = function (NativeClass) {
        switch (NativeClass) {
            case Array: return CHITCHAT.builtins.Array;
            case Boolean: return CHITCHAT.builtins.Boolean;
            case Function: return CHITCHAT.builtins.Function;
            case Number: return CHITCHAT.builtins.Number;
            case Object: return CHITCHAT.builtins.Object;
            case RegExp: return CHITCHAT.builtins.RegExp;
            case String: return CHITCHAT.builtins.String;
            default: return null;
        } 
    };
    
    CHITCHAT.getShimForValue = getShimForValue = function (value) {
        return CHITCHAT.builtins[ type(value) ] || CHITCHAT.builtins.Object;
    };

    isFunction = function (obj) {
        return type(obj) === 'Function';
    };
}.call(this));
