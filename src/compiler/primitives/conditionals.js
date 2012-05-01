/*globals require: false, module: false, exports: false, console: false */
var JSIfEmitter = require('../emitter.js').JSIfEmitter;

module.exports = {
    'if': function (arr) {
        var compileIf = function (arr) {
            switch (arr.length) {
                case 0:
                case 1:
                    throw new SyntaxError();

                case 2:
                    return new JSIfEmitter(this.compile(arr[0]),
                                           this.compile(arr[1]),
                                           null);

                case 3:
                    return new JSIfEmitter(this.compile(arr[0]),
                                           this.compile(arr[1]),
                                           this.compile(arr[2]));

                default:
                    return new JSIfEmitter(this.compile(arr[0]),
                                           this.compile(arr[1]),
                                           compileIf(arr.slice(2)));
            }
        }.bind(this);

        return compileIf(arr);
    }
};
