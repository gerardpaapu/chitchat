var assert = require('assert'); 

var Primitive = function (emit) {
    this.emit = emit;
};

// emit: stx, env -> javascript 
Primitive.prototype.emit = function (stx, env, compile) {
    throw new Error("Not Implemented");
}; 

primitives = {
    'with-modules': function (stx, env, compile) {
        
    },

    'localize': function (stx, env, compile) {

    },

    'function': function (stx, env, compile) {
        return format('function ($0) { $1;\nreturn $2; }');
    },

    'if': function (stx, env, compile) {
        assert.ok(stx.length === 3);

        return format('($0?$1:$2)', 
                      compile(stx[1], env),
                      compile(stx[2], env));
    },

    'try': function (stx, env, compile) {
    },

    'throw': function (stx, env, compile) {
        
        return format('throw $0', compile(stx[1]));
    }
};
