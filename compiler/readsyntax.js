var ENV = require('./env.js'),
    Reader = require('./reader.js'),
    datumToSyntax,
    symbolToIdentifier,
    Identifier;

symbolToIdentifier = function (symbol, env) {
    return new Identifier(env.lookup(symbol)); 
};
exports.SyntaxReader = SyntaxReader;


