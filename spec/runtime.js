/*globals module: false */
var assert = require('assert'),
    vows = require('vows'),
    passMessage = require('../runtime/passMessage.js').passMessage,
    classString = require('../runtime/classString.js').classString;

vows.describe('Passing Messages to builtins').addBatch({
    'Slice the arguments object': {
        topic: function () {
            return (function (){
                return passMessage(arguments, 'slice', [1, 3]);
            }(1, 2, 3, 4, 5));
        },

        'We get an Array': function (topic) {
            assert.equal(classString(topic), 'Array');
        },

        'With the correct contents': function (topic) {
            assert.deepEqual(topic, [2, 3]);
        }
    },

    'Call Array.range': {
        topic: function () {
            return passMessage(Array, 'range', [2, 10]);
        },

        'We get an Array': function (topic) {
            assert.equal(classString(topic), 'Array');
        },

        'With the correct contents': function (topic) {
            assert.deepEqual(topic, [2, 3, 4, 5, 6, 7, 8, 9]);
        }
    },

    'Call builtins.Object methods': {
        topic: function () {
            return new Date();
        },

        'Date isDate?': function (topic) {
            assert.ok(passMessage(topic, 'date?'));
        },

        'Date isnt null?': function (topic) {
            assert.isFalse(passMessage(topic, 'null?'));
        }
    }
}).run();
