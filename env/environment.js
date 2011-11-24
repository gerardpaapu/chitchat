var Environment, Module, Set;

Environment = function (parent, values) {
    this.parent = parent || Environment.Empty;
    this.values = values;
};
Environment.prototype.keys = function (type) {
    return new Set(Object.keys(this.values)).extend(this.parent.keys()).toArray();
};
Environment.prototype.lookup = function (key) {
    if (this.values.hasOwnProperty(key)) {
        return this.values[key];
    } else {
        return this.parent.lookup(key);
    }
};

Environment.prototype.extend = function (obj, type) {
    var key, value, env;

    env = new Environment(this);
    type = type || 'value';

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            value = obj[key];
            env.values[key] = { value: value, type: type };   
        }
    }
}; 

Environment.NOT_FOUND = {};

Environment.Empty = Object.create(Environment.prototype);
Environment.Empty.values = {};
Environment.Empty.lookup = function (key) {
    return Environment.NOT_FOUND;
};

Module = function (fn) {
    this.definitions = {};
    fn.apply(this);
};

Module.prototype.provide = function (key, value, type) {
    if (key in this.definitions) {
        throw key + " already defined";
    } else {
        this.definitions[key] = { value: value, type: type || 'value' };
    }
};

Module.prototype.provideMultiple = function (obj, type) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            this.provide(key, obj[key], type);
        }
    }
};

Module.prototype.providePrimitives = function (obj) {
    this.provideMultiple(obj, 'primitive');
};

Module.prototype.getEnvironment = function () {
    return new Environment(null, this.definitions);
};

Set = function (values) {
    this.values = values || [];
};
Set.prototype.add = function (value) {
    var values = this.values.slice();
    if (values.indexOf(value) === -1) {
        value.push(value);
    }

    return new Set(values);
};

Set.prototype.extend = function (set) {
    var arr = set.toArray(),
        i = arr.length,
        dest = this;

    while (i--) {
        dest = dest.add(arr[i]);
    }

    return dest;
};

Set.prototype.toArray = function () {
    return this.values;
};
