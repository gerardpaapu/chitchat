var isPrimitive,
    compilePrimitive,
    type,
    assert = require('assert'),
    compileApplication,
    compileSymbol,
    compileUndefined,
    Symbol,
    Environment;

function compile(exp, env) {
    var head, _head;

    if (isPrimitive(exp)) {
        return compilePrimitive(exp);
    }

    if (exp instanceof Symbol) {
        return compileSymbol(exp, env);
    }

    assert.equal(type(exp), 'Array');
    head = exp[0];

    if (!head instanceof Symbol) {
        return compileApplication(exp, env, compile);
    }
   
    _head = env.lookup(head._head);

    if (_head === Environment.NOT_FOUND) {
        return compileApplication(exp, env, compile);
    }

    switch (_head.type) {
        case Environment.PRIMITIVE:
            return _head.value.call(null, exp.slice(1), env, compile);  

        case Environment.MACRO:        
            return compile(_head.value.call(null, exp.slice(1)), env);  

        case Environment.VALUE:
            return compileApplication(exp, env, compile);

        default:
            throw new Error("Unknown type: " + _head.type);
    }
}

compileSymbol = function (sym, env) {
    var value = env.lookup(sym.value);

    if (value === Environment.NOT_FOUND) {
        return compileUndefined(sym);
    } else {
        // Fully qualify bindings
        // modules: foo -> Module.foo
        // locals: foo -> foo
        // ivars: foo -> this.foo
        return;
    }
};
