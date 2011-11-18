/*globals module: false */
var assert = require('assert'),
    vows = require('vows'),
    CHITCHAT = require('../runtime/index.js');

vows.describe('Passing Messages to builtins').addBatch({
    'Slice the arguments object': {
        topic: function () {
            return (function (){
                return CHITCHAT.passMessage(arguments, 'slice', [1, 3]);
            }(1, 2, 3, 4, 5));
        },

        'We get an Array': function (topic) {
            assert.equal(CHITCHAT.type(topic), 'Array');
        },

        'With the correct contents': function (topic) {
            assert.deepEqual(topic, [2, 3]);
        }
    },

    'Call Array.range': {
        topic: function () {
            return CHITCHAT.passMessage(Array, 'range', [2, 10]);
        },

        'We get an Array': function (topic) {
            assert.equal(CHITCHAT.type(topic), 'Array');
        },

        'With the correct contents': function (topic) {
            assert.deepEqual(topic, [2, 3, 4, 5, 6, 7, 8, 9]);
        }
    }

}).run();

/*
assert.equal(CHITCHAT.getShimForValue(Array), CHITCHAT.builtins.Array);
assert.equal(CHITCHAT.getShimForValue(Boolean), CHITCHAT.builtins.Boolean);
assert.equal(CHITCHAT.getShimForValue(Error), CHITCHAT.builtins.Error);
assert.equal(CHITCHAT.getShimForValue(Function), CHITCHAT.builtins.Function);
assert.equal(CHITCHAT.getShimForValue(RegExp), CHITCHAT.builtins.RegExp);
assert.equal(CHITCHAT.getShimForValue(String), CHITCHAT.builtins.String);
assert.equal(CHITCHAT.passMessage(Function, 'Class', []), CHITCHAT.builtins.Function.Class);
*/
