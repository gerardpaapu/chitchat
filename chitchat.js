/*globals CHITCHAT: true */
var CHITCHAT = CHITCHAT || {};
(function () {
    /*jshint eqnull: true */
    var passMessage, getImplementation, defaults, type, isFunction, NULL;

    CHITCHAT.NULL = NULL = {};

    CHITCHAT.passMessage = passMessage = function (receiver, selector, args) {
        receiver = receiver != null ? receiver : NULL;
        implementation = getImplementation(receiver, selector);

        if (implementation != null) {
            implementation.apply(receiver, args);
        } else {
            throw new TypeError('Not Implemented');
        }
    };

    getImplementation = function () {
        return isFunction(receiver[selector]) ? receiver[selector] 
            :  isFunction(defaults[selector]) ? defaults[selector] 
            :  null;
    };

    builtins = {
        Object: {
            getMethod: function (selector) {
                return getImplementation(this, selector);
            },

            respondsTo: function (selector) {
                return getImplementation(this, selector) != null;
            },

            isNull: function () {
                return this == CHITCHAT.NULL;
            },

            isA: function (type) {

            },

            isAn: function () {

            },

            typeString: function () {
                return type(this); 
            }
        },

        Number: {},

        String: {},

        Array: {},

        Function: {
            extend: function () {

            },

            doTimes: function () {}
        },

        Null: {}
    };


    type = function (obj) {
        return obj === this      ? 'Global'
            :  obj === undefined ? 'Undefined'
            :  obj === null      ? 'Null'
            :  Object.prototype.toString.call(obj).slice(8, -1); 
    };

    isFunction = function (obj) {
        return type(obj) === 'Function';
    };
}.call(this));
