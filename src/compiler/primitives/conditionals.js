var format = require('../format.js').format;

module.exports = {
    'if': function (stx, compiler) {
        function compile(stx) {
            return compiler.compile(stx);
        }

        var test, true_branch, false_branch,
            i, max, tail, result = '', args = stx;

        if (args.length < 2) throw new SyntaxError();

        if (args.length % 2 > 0) {
            max = args.length - 2;
            tail = compile(args[args.length - 1]);
        } else {
            max = args.length - 1;    
            tail = 'null';
        }

        for (i = 0; i < max; i += 2) {
            result += format('$0?$1:',
                             compile(args[i]),
                             compile(args[i + 1]));
        }

        result += tail;

        return result;
    }
};

