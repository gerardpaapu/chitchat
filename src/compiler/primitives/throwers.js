// These constructs are not meant to be standalone expressions, so if we 
// encounter them they throw a SyntaxError
var $throw = function (name) {
    return function (stx, compiler) {
        throw new SyntaxError(name + " shouldn't be compiled");
    };
};

module.exports = {
    '#MSG': $throw('#MSG'),
    '#BINDINGS': $throw('#BINDINGS')
};
