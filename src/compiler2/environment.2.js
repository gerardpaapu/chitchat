var Environment, Binding, LocalBinding, InstanceBinding, ModuleBinding, ExternalBinding;
// Environment is a compile time construct that contains (lexically scoped) bindings for symbols.
Environment = function (parent, bindings) {
    this.parent = parent || Environment.EMPTY;
    this.bindings = bindings;
};

// lookup: Symbol -> Binding | NOT_FOUND
Environment.prototype.lookup = function (symbol) {
    if (this.bindings.hasOwnProperty(symbol.value)) {
        return this.bindings[symbol.value];
    } else {
        return this.parent.lookup(symbol);
    }
};

// addBinding: Binding -> Environment
Environment.prototype.addBinding = function (binding) {
    var _bindings = {};
    _bindings[binding.symbol.value] = binding;
    return new Environment(this, _bindings);
};

// addBindings: [ Binding ] -> Environment
Environment.prototype.addBindings = function (bindings) {
    var _bindings = {},
        i = bindings.length,
        key;  

    while (i--) {
        key = bindings[i].symbol.value;
        bindings[key] = bindings[i];
    }

    return new Environment(this, _bindings);
};

Environment.NOT_FOUND = {};

Environment.EMPTY = Object.create(Environment.prototype);
Environment.EMPTY.lookup = function (symbol) {
    return Environment.NOT_FOUND;
};


// There are three types of bindings: local, module, external and instance 
Binding = function () {};
Binding.prototype.symbol = null;
Binding.prototype.isSyntax = false;
Binding.prototype.compile = function () { throw "Not Implemented"; };

// local variables are created in `(let (var ...) body...)` forms and in
// function parameters  and have an associated 'location' property which 
// uniquely identifies the localize form they were bound in. They are compiled 
// with this unique ID to differentiate them from *other* local bindings 
// with the same name (perhaps introduced by hygenic macros).
// e.g. foo -> foo_kasmdu3
//
// if it is introduced with the `(let-syntax (var ...) body ...)` form
// it is also tagged as 
LocalBinding = function (symbol, location, isSyntax) {
    this.symbol = symbol;
    this.location = location;
    this.isSyntax = !!isSyntax;
};

LocalBinding.prototype = Object.create(Binding.prototype);

LocalBinding.prototype.type = 'local';

// Module bindings are imported with the `(import module)` form, and
// are associated with the information to fully qualify those references
// e.g. foo -> window.bar.baz.foo
ModuleBinding = function (symbol, module, isSyntax) {
    this.symbol = symbol;
    this.module = module;
    this.isSyntax = !!isSyntax;
};

ModuleBinding.prototype = Object.create(Binding.prototype);

ModuleBinding.prototype.type = 'module';

// Instance Bindings are created with the `(with-ivars (var ...) body ...)`
// form and are compiled to properties of the javascript context variable `this`
// e.g. foo -> this.foo
InstanceBinding = function (symbol) {
    this.symbol = symbol;
};

InstanceBinding.prototype = Object.create(Binding.prototype);

InstanceBinding.prototype.type = 'instance';

// External Bindings are variables that are bound to javascript variables 
// they contain the symbol which we will refer to them by in the Chitchat world
// and the information required to refer to the original javascript variable
// e.g. foo -> window.JSON
ExternalBinding = function (symbol, qualifier) {
    this.symbol = symbol;
    this.qualifier = qualifier;
};

ExternalBinding.prototype = Object.create(Binding.prototype);

ExternalBinding.prototype.type = 'external';

exports.Environment = Environment;
exports.Binding = Binding;
exports.LocalBinding = LocalBinding;
exports.InstanceBinding = InstanceBinding;
exports.ModuleBinding = ModuleBinding;
exports.ExternalBinding = ExternalBinding;
