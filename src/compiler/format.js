var classString = require('../runtime/classString.js').classString,
    assert = require('assert');

exports.format = function (template) {
    var values = [].slice.call(arguments, 1);

    return template.replace(/\$(\d+)/g, function (_, n) {
        assert.equal(classString(n), 'String');
        return values[n];
    }); 
};
