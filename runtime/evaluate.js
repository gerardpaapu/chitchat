var CHITCHAT = require('./index.js'),
    compile = require('../compiler/compile.js').compile;

exports.run = function (src) {
    var js = compile(src);
    console.log(src);
    console.log(js);
    return eval(js);
};
