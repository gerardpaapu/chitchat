/*globals CHITCHAT: false */
(function () {
    /*jshint eqnull: true */
    var passMessage, getImplementation, defaults, type, isFunction, NULL;

    NULL = new CHITCHAT.builtins.Null();

    CHITCHAT.passMessage = passMessage = function (receiver, selector, args) {
        // If the receiver is null we coerce it to CHITCHAT.NULL_INSTANCE
        // So that we can still pass it a message
        receiver = receiver != null ? receiver : NULL;

        // The implementation is the concrete method that will handle the message
        // all the smoke and mirrors occur within `getImplementation`
        implementation = getImplementation(receiver, selector);

        if (implementation == null) {
            if (selector === 'methodMissing') throw new Error('methodMissing implementation not found');
            passMessage(receiver, 'methodMissing', [selector].concat(args));
        }

        return implementation.apply(receiver, args);
    };

    getImplementation = function (receiver, selector) {
        var fallback, OBJECT;
       
        if (selector in receiver) {
            // The receiver has a property called 'selector', if it is a method return that.
            // otherwise generate an accessor and return that.
            return isFunction(receiver[selector]) ? receiver[selector] : function () { return this[selector]; };
        }

        // The receiver doesn't have implementation for this message
        // but we might have one in the shim for its native type    
        // or the shim for Object
        Fallback = CHITCHAT.builtins[ type(receiver) ];
        OBJECT = CHITCHAT.builtins.Object;

        return Fallback.prototype[selector] || OBJECT.prototype[selector] || null;
    };

    CHITCHAT.builtins = {};

    type = function (obj) {
        return obj === this ? 'Global'
            :  obj === undefined ? 'Undefined'
            :  obj === null || obj === CHITCHAT.NULL ? 'Null'
            :  Object.prototype.toString.call(obj).slice(8, -1); 
    };

    isFunction = function (obj) {
        return type(obj) === 'Function';
    };
}.call(this));
