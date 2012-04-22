module.exports = {
    'or': function (stx, compiler) {
        return stx.map(function (s) { return compiler.compile(s); }).join(' || ');
    },
    'and': function (stx, compiler) {
        return stx.map(function (s) { return compiler.compile(s); }).join(' && ');
    }
};
