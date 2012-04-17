var get = require('message-passing').get,
    passMessage = require('message-passing').passMessage;

var Ord = new Protocol({
    'greater-than': [Ord, Ord, Boolean],
    'equal': [Ord, Ord, Boolean]
});

Ord.implement(Number, {
    'greater-than': function (a, b) {
        return a > b;
    },

    'equal': function (a, b) {
        return a == b;
    }
});

var OrderedSet = function (items, ordered, distinct) {
    this.items = items || [];

    if (passMessage(distinct, 'isFalse?')) { 
        passMessage(this, 'uniqify!');
    } else if (passMessage(ordered, 'isFalse?')) {
        passMessage(this, 'sort!');
    }
};

OrderedSet.prototype['contains?'] = function (needle) {
    return passMessage(passMessage(this, 'items'), 'contains?', [needle]);
};

OrderedSet.prototype.asArray = function () {
    return passMessage(passMessage(this, 'items'), 'cloneArray');
};

OrderedSet.prototype.slice = function (a, b) {
    return passMessage(passMessage(this, 'items'), 'slice', [a, b]);
};

OrderedSet.prototype.nth = function (i) {
    return get(passMessage(this, 'items'), i);
};

OrderedSet.prototype.length = function () {
    return passMessage(passMessage(this, 'items'), 'length');
};

OrderedSet.prototype.concat = function (ls) {
    var dest = this,

        items = (  passMessage(ls, 'isAn', [OrderedSet]) ? passMessage(ls, 'items')
                 : passMessage(ls, 'isAn', [Array]) ? ls
                 : null),

        new_items = ls.filter(function () {
            return passMessage(dest, 'contains', [ arguments[0] ]);
        });

    return passMessage(new_items, 'isEmpty?') ? this
        :  passMessage(OrderedSet, 'new', [ passMessage(passMessage(this, 'items'), 'concat', [new_items]),
                                            true]);
};

OrderedSet.prototype['sort!'] = function () {
    return passMessage(passMessage(this, 'items'),
                'sort',
                function () {
                    return passMessage(Ord, 'greater-than', [arguments[0], arguments[1]]) ? MORE
                        :  passMessage(Ord, 'greater-than', [arguments[1], arguments[0]]) ? LESS
                        :  EQUAL;
                });
}; 

OrderedSet.prototype['uniqify!'] = function () {
    return (this.items = passMessage(passMessage(this, 'items'),
                                    'reduce',
                                    [
                                        function (out, item) {
                                            return passMessage(out, 'contains?', item) ? out
                                                :  passMessage(out, 'concat', item);  
                                        },
                                        []
                                    ]));
};
