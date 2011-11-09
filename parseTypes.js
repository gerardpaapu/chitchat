CHITCHAT.ParseTypes = {
    FunctionExpression: function (args, vars, body) {
        this.args = args;
        this.vars = vars;
        this.body = body; 
    },

    Reference: function (parent, key) {
        this.parent = parent;
        this.key = key;
    },

    Assignment: function (ref, value) {
        this.ref = ref;
        this.value = value;
    },

    ArrayLiteral: function (values) {
        this.values = values;
    },

    DictionaryLiteral: function (keys, values) {
        this.keys = keys;
        this.values = values;
    },

    StringLiteral: function (value) {
        this.value = value;
    },
    
    NumberLiteral: function (value) {
        this.value = value; 
    },

    TryCatchBlock: function (tryBlock, catchVar, catchBlock, finallyBlock) {
        this.tryBlock = tryBlock; 
        this.catchVar = catchVar;
        this.catchBlock = catchBlock;
        this.finallyBlock = finallyBlock;
    },

    Throw: function (exp) {
        this.exp = exp;
    }
};
